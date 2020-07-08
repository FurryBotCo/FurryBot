import DB from "@donovan_dmc/db";
import config from "../config";
import { MongoClient, Db, MongoClientOptions, Collection, MongoError, WithId } from "mongodb";
import { Internal, Strings, Time } from "../util/Functions";
import Timers from "../util/Timers";
import UserConfig from "./config/UserConfig";
import GuildConfig from "./config/GuildConfig";
import { Redis } from "./External";
import FurryBot from "../main";
import Logger from "../util/LoggerV10";
import Eris, { Guild } from "eris";
import deasync from "deasync";
import { Colors } from "../util/Constants";

class Database {
	conn: {
		mongo: MongoClient;
		mdb: Db
	};
	debug: boolean;
	client: FurryBot;
	constructor(host: string, port: number, database: string, opt: MongoClientOptions, debug?: boolean) {
		this.conn = DB(host, port, database, opt);
		this.debug = !!debug;
		this.client = {
			log: () => null
		} as any;
	}

	setClient(client: FurryBot) { this.client = client; }

	collection(name: "guilds"): Collection<GuildConfig>;
	collection(name: "users"): Collection<UserConfig>;
	collection<T>(name: string) {
		return this.mdb.collection<T>(name);
	}

	get mdb() {
		return this.conn.mdb;
	}

	get mongo() {
		return this.conn.mongo;
	}

	async getUser(id: string, skipCache?: boolean): Promise<UserConfig>;
	async getUser<F extends (err: Error, d: UserConfig) => any>(id: string, skipCache: boolean, cb: F): Promise<UserConfig>;
	async getUser<F extends (err: Error, d: UserConfig) => any>(id: string, skipCache?: boolean, cb?: F): Promise<UserConfig | F> {
		skipCache = !!skipCache;
		const t = new Timers(this.client);
		t.start("user");
		let u: UserConfig;
		if (!skipCache) {
			const k = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:db:uConfig:${id}`);
			if (!k) skipCache = true;
			else {
				try {
					u = new UserConfig(id, JSON.parse(k));
				} catch (e) {
					this.client.log("error", `db cache error ${e}`, "Database | User");
					skipCache = true;
				}
			}
		}

		if (skipCache) {
			u = await this.collection("users").findOne({ id }).then(res => res ? new UserConfig(id, res) : null);
			await Redis.SETEX(`${config.beta ? "beta" : "prod"}:db:uConfig:${id}`, 60, JSON.stringify(u));
		}

		if (!u) {
			await this.mdb.collection("users").insertOne({ ...config.defaults.config.user, id }).catch((err: MongoError) => {
				switch (err.code) {
					case 11000: { this.client.log("warn", `Duplicate key error (key: ${(err as any).keyValue.id})`, "Database | User"); break; }
					default: this.client.log("error", err, "Database | User");
				}
			});
			this.client.log("debug", `Created user entry "${id}".`, "Database | User");
			u = await this.collection("users").findOne({ id }).then(res => res ? new UserConfig(id, res) : null);
		}
		t.end("user");
		if (this.debug) this.client.log("debug", `Database query for the user "${id}" took ${t.calc("user", "user")}ms.`, `Database`);

		if (!cb) return u;
		else return cb(null, u);
	}


	async getGuild(id: string, skipCache?: boolean): Promise<GuildConfig>;
	async getGuild<F extends (err: Error, d: GuildConfig) => any>(id: string, skipCache: boolean, cb: F): Promise<GuildConfig>;
	async getGuild<F extends (err: Error, d: GuildConfig) => any>(id: string, skipCache?: boolean, cb?: F): Promise<GuildConfig | F> {
		skipCache = !!skipCache;
		const t = new Timers(this.client);
		t.start("guild");
		let g: GuildConfig;
		if (!skipCache) {
			const k = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:db:gConfig:${id}`);
			if (!k) skipCache = true;
			else {
				try {
					g = new GuildConfig(id, JSON.parse(k));
				} catch (e) {
					this.client.log("error", `db cache error ${e}`, "Database | Guild");
					skipCache = true;
				}
			}
		}

		if (skipCache) {
			g = await this.collection("guilds").findOne({ id }).then(res => res ? new GuildConfig(id, res) : null);
			await Redis.SETEX(`${config.beta ? "beta" : "prod"}:db:gConfig:${id}`, 60, JSON.stringify(g));
		}

		if (!g) {
			// this mess is to set the prefix to the config default instead of what's in the guildConfig defaults
			const t = { ...config.defaults.config.guild };
			delete t.settings;
			await this.mdb.collection("guilds").insertOne({ ...t, settings: { ...config.defaults.config.guild.settings, prefix: config.defaults.prefix }, id }).catch((err: MongoError) => {
				switch (err.code) {
					case 11000: { this.client.log("warn", `Duplicate key error (key: ${(err as any).keyValue.id})`, `Database`); break; }
					default: this.client.log("error", err, `Database`);
				}
			});
			this.client.log("debug", `Created guild entry "${id}".`, `Database`);
			g = await this.collection("guilds").findOne({ id }).then(res => res ? new GuildConfig(id, res) : null);
		}

		t.end("guild");
		if (this.debug) this.client.log("debug", `Database query for the guild "${id}" took ${t.calc("guild", "guild")}ms.`, `Database`);

		if (!cb) return g;
		else return cb(null, g);
	}

	async checkBl(type: "guild", guildId: string): Promise<{ [k in "all" | "expired" | "current" | "notice"]: Blacklist.GuildEntry[]; }>;
	async checkBl(type: "user", userId: string): Promise<{ [k in "all" | "expired" | "current" | "notice"]: Blacklist.UserEntry[]; }>;
	async checkBl(type: "guild" | "user", id: string): Promise<{ [k in "all" | "expired" | "current" | "notice"]: Blacklist.GenericEntry[]; }> {
		const d = Date.now();
		const all = await mdb.collection<Blacklist.GenericEntry>("blacklist").find({ [`${type}Id`]: id }).toArray();
		const expired = all.filter(bl => ![0, null].includes(bl.expire) && bl.expire < d);
		const current = all.filter(bl => !expired.map(j => j.id).includes(bl.id));
		const notice = current.filter(bl => !bl.noticeShown);

		return {
			all,
			expired,
			current,
			notice
		};
	}

	async addBl(type: "guild", guildId: string, blame: string, blameId: string, reason?: string, expire?: number, report?: string): Promise<WithId<Blacklist.GuildEntry>>;
	async addBl(type: "user", userId: string, blame: string, blameId: string, reason?: string, expire?: number, report?: string): Promise<WithId<Blacklist.UserEntry>>;
	async addBl(type: "guild" | "user", id: string, blame: string, blameId: string, reason?: string, expire?: number, report?: string) {
		const e = Strings.random(7);
		if (!reason) reason = "None Provided.";
		if (!this.client || typeof this.client.bot.getRESTUser === "undefined" || typeof this.client.bot.getRESTGuild === "undefined") Logger.warn("Database", "Missing client on blacklist addition, webhook not executed.");
		else {
			const d = type === "guild" ? await this.client.bot.getRESTGuild(id) : await this.client.bot.getRESTUser(id);
			const prev = type === "guild" ? await this.getGuild(id).then(g => g.checkBlacklist().then(b => b.all.length)) : await this.getUser(id).then(u => u.checkBlacklist().then(b => b.all.length));
			await this.client.w.get("blacklist").execute({
				embeds: [
					{
						title: `${Strings.ucwords(type)} Blacklisted`,
						description: [
							`${Strings.ucwords(type)} Id: ${id}`,
							`Entry ID: ${e}`,
							`${d instanceof Eris.Guild ? `Name: ${d.name}` : `Tag: ${d.username}#${d.discriminator}`}`,
							`Reason: ${reason}`,
							`Blame: ${blame} (${blameId})`,
							`Expiry: ${[0, null, undefined].includes(expire) ? "Never" : Time.formatDateWithPadding(expire, false)}`,
							`Previous Blacklists: ${prev} (Strike #${prev + 1})`,
							...(!!report ? [`Report: ${report}`] : [])
						].join("\n"),
						color: Colors.red,
						timestamp: new Date().toISOString()
					}
				]
			});
		}
		return mdb.collection<Blacklist.GenericEntry>("blacklist").insertOne({
			created: Date.now(),
			type,
			blame,
			blameId,
			reason,
			id: e,
			noticeShown: false,
			expire,
			report,
			...(type === "guild" ? { guildId: id } : { userId: id })
		}).then(res => res.ops[0]);
	}

	async getModlogEntryId(guildId: string) {
		return (await mdb.collection<ModLogEntry.GenericEntry>("modlog").find({ guildId }).count()) + 1;
	}

	async getWarningEntryId(guildId: string, userId: string) {
		return (await mdb.collection<Warning>("warnings").find({ guildId, userId }).count()) + 1;
	}

	async checkVote(user: string) {
		const v = await mongo.db("furrybot").collection<Vote.DBLVote>("votes").find({ user }).toArray();

		const e = v.find(e => Date.now() < e.time + 4.32e+7);

		return {
			voted: !!e,
			weekend: !!e && !!e.weekend
		};
	}
}

const db = new Database(config.db.host, config.db.port, config.db.database, config.db.opt, config.beta);
const mdb = db.mdb;
const mongo = db.mongo;

export { mdb };
export { mongo };
export { db };
export default db;
