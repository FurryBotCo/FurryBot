/* eslint-disable @typescript-eslint/unified-signatures */
import GuildConfig from "./Models/GuildConfig";
import UserConfig from "./Models/UserConfig";
import FurryBot from "../main";
import { ModLogEntry, Votes, Warning } from "../util/@types/Database";
import config from "../config";
import Blacklist from "../util/@types/Blacklist";
import { Colors, DataTypes, DBLike } from "core";
import { Strings, Time, Timers } from "utilities";
import IORedis from "ioredis";
import Logger from "logger";
import { Guild } from "eris";
import { Collection, MongoClient } from "mongodb";
import crypto from "crypto";

class Database implements DBLike {
	client: FurryBot | null = null;
	r: IORedis.Redis;
	mongo: MongoClient;
	mainDB: string;
	setClient(client: FurryBot) { this.client = client; return this; }

	async init(db = true, redis = true) {
		if (db) await this.initDb();
		if (redis) await this.initRedis();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	initSync(db = true, redis = true) {
		throw new Error("method not implemented.");
		/* deasync((cb: (err: Error | null) => void) => {
			void this.init(db, redis).then(() => {
				cb(null);
			});
		})();

		return this; */
	}

	private async initDb() {
		const d = config.services.db;
		this.mainDB = config.beta ? d.dbBeta : d.db;
		const dbString = `mongodb://${d.host}:${d.port}?retryWrites=true&w=majority`;
		try {
			const t = new Timers(false);
			t.start("connect");
			Logger.debug("Database", `Connecting to ${dbString} (SSL: ${d.options.ssl ? "Yes" : "No"})`);
			// eslint-disable-next-line @typescript-eslint/unbound-method
			this.mongo = await MongoClient.connect(dbString, d.options);
			t.end("connect");
			Logger.debug("Database", `Connected to ${dbString} (SSL: ${d.options.ssl ? "Yes" : "No"}) in ${t.calc("connect")}ms`);
		} catch (e) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			Logger.error("Database", `Error connecting to MongoDB instance (${dbString}, SSL: ${d.options.ssl ? "Yes" : "No"})\nReason: ${"stack" in e ? (e as { stack: string; }).stack : e}`);
			return; // don't need to rethrow it as it's already logged
		}
	}

	private async initRedis() {
		return new Promise<void>(resolve => {
			const rd = config.services.redis;
			const redis = this.r = new IORedis(rd.port, rd.host, {
				password: rd.password,
				db: config.beta ? rd.dbBeta : rd.db,
				enableReadyCheck: true,
				autoResendUnfulfilledCommands: true,
				connectionName: `FurryBot${config.beta ? "Beta" : ""}`
			});

			redis.on("connect", () => {
				Logger.debug("Redis", `Connected to redis://${rd.host}:${rd.port} (db: ${config.beta ? rd.dbBeta : rd.db})`);
				resolve();
			});
		});
	}

	get mdb() { return this.mongo.db(this.mainDB); }

	collection<T = DataTypes<UserConfig>>(col: "users"): Collection<T>;
	collection<T = DataTypes<GuildConfig>>(col: "guilds"): Collection<T>;
	collection<T = Warning>(col: "warnings"): Collection<T>;
	collection<T = ModLogEntry.AnyModLogEntry>(col: "modlog"): Collection<T>;
	collection<T = Blacklist.GenericEntry>(col: "blacklist"): Collection<T>;
	collection<T = unknown>(col: string): Collection<T>;
	collection<T = unknown>(col: string) {
		return this.mdb.collection<T>(col);
	}

	async getUser(id: string) {
		return this.collection("users").findOne({ id }).then(async(d) => {
			if (d === null) d = await this.collection("users").insertOne({
				...config.defaults.config.user,
				id
			}).then(res => res.ops[0]);

			return new UserConfig(id, d!);
		});
	}

	async getGuild(id: string) {
		return this.collection("guilds").findOne({ id }).then(async(d) => {
			if (d === null) d = await this.collection("guilds").insertOne({
				...(config.defaults.config.guild as typeof config["defaults"]["config"]["guild"] & { settings: { lang: "en"; };}),
				id
			}).then(res => res.ops[0]);

			return new GuildConfig(id, d!);
		});
	}

	async checkBl(type: "guild", guildId: string): Promise<{ [k in "all" | "expired" | "current" | "notice"]: Array<Blacklist.GuildEntry>; }>;
	async checkBl(type: "user", userId: string): Promise<{ [k in "all" | "expired" | "current" | "notice"]: Array<Blacklist.UserEntry>; }>;
	async checkBl(type: "guild" | "user", id: string): Promise<{ [k in "all" | "expired" | "current" | "notice"]: Array<Blacklist.GenericEntry>; }> {
		const d = Date.now();
		const all = await this.collection<Blacklist.GenericEntry>("blacklist").find({ [`${type}Id`]: id }).toArray();
		const expired = all.filter(bl => ![0, null].includes(bl.expire!) && bl.expire! < d);
		const current = all.filter(bl => !expired.map(j => j.id).includes(bl.id));
		const notice = current.filter(bl => !bl.noticeShown);

		return {
			all,
			expired,
			current,
			notice
		};
	}

	async addBl(type: "guild", guildId: string, blame: string, blameId: string, reason?: string, expire?: number, report?: string): Promise<Blacklist.GuildEntry>;
	async addBl(type: "user", userId: string, blame: string, blameId: string, reason?: string, expire?: number, report?: string): Promise<Blacklist.UserEntry>;
	async addBl(type: "guild" | "user", id: string, blame: string, blameId: string, reason?: string, expire?: number, report?: string): Promise<Blacklist.GenericEntry> {
		const e = crypto.randomBytes(7).toString("hex");
		if (!reason) reason = "None Provided.";
		if (!this.client) Logger.warn("Database", "Missing client on blacklist addition, webhook not executed.");
		else {
			const d = type === "guild" ? await this.client.getGuild(id) : await this.client.getUser(id);
			if (d === null) throw new TypeError(`expected null ${type} in Database#addBl`);
			const prev = type === "guild" ? await this.getGuild(id).then(g => g.checkBlacklist().then(b => b.all.length)) : await this.getUser(id).then(u => u.checkBlacklist().then(b => b.all.length));
			await this.client.w.get("blacklist")!.execute({
				embeds: [
					{
						title: `${Strings.ucwords(type)} Blacklisted`,
						description: [
							`${Strings.ucwords(type)} Id: ${id}`,
							`Entry ID: ${e}`,
							`${d instanceof Guild ? `Name: ${d.name}` : `Tag: ${d.username}#${d.discriminator}`}`,
							`Reason: ${reason}`,
							`Blame: ${blame} (${blameId})`,
							`Expiry: ${[0, null, undefined].includes(expire) ? "Never" : Time.formatDateWithPadding(expire, false)}`,
							`Previous Blacklists: ${prev} (Strike #${prev + 1})`,
							...(report ? [`Report: ${report}`] : [])
						].join("\n"),
						color: Colors.red,
						timestamp: new Date().toISOString()
					}
				]
			});
		}
		return this.collection<Blacklist.GenericEntry>("blacklist").insertOne({
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

	async checkVote(user: string) {
		const v = await this.mongo.db("furrybot").collection<Votes.AnyVote>("votes").find({ user }).toArray();

		const e = v.find(t => Date.now() < t.time + 4.32e+7);

		return {
			voted: e,
			weekend: e && "weekend" in e && e.weekend
		};
	}
}
const db = new Database();
/* const { r: Redis, mongo } = db;
export { Redis, mongo }; */
export default db;
