import { MongoClient, Collection, MongoError, WithId } from "mongodb";
import config from "../config";
import Logger from "./Logger";
import UserConfig, { DBKeys as UserDBKeys } from "./config/UserConfig";
import GuildConfig, { DBKeys as GuildDBKeys } from "./config/GuildConfig";
import Timers from "./Timers";
import DB from "@donovan_dmc/db";
import Strings from "./Functions/Strings";
import FurryBot from "../bot";
import crypto from "crypto";
import Eris from "eris";
import Time from "./Functions/Time";
import { Colors } from "./Constants";
import { performance } from "perf_hooks";

class Database {
	client: FurryBot;
	#conn: MongoClient;
	#connected: boolean;
	constructor() {
		this.client = null;
		this.#connected = false;
		this.launch();
	}

	setClient(client: FurryBot) { this.client = client; }

	async launch() {
		this.connect();
	}

	private connect() {
		try {
			const t = new Timers(false);
			t.start("connect");
			Logger.debug("Database", `Connecting to mongodb://${config.db.host}:${config.db.port}?retryWrites=true&w=majority (SSL: ${config.db.options.ssl ? "Yes" : "No"})`);
			this.#conn = DB(config.db.host, config.db.port, config.db.options);
			t.end("connect");
			Logger.debug("Database", `Connected to mongodb://${config.db.host}:${config.db.port}?retryWrites=true&w=majority (SSL: ${config.db.options.ssl ? "Yes" : "No"}) in ${t.calc("connect")}ms`);
			this.#connected = true;
		} catch (e) {
			Logger.error("Database", `Error connecting to MongoDB instance (mongodb://${config.db.host}:${config.db.port}?retryWrites=true&w=majority, SSL: ${config.db.options.ssl ? "Yes" : "No"})\nReason: ${e.stack || e}`);
			return; // don't need to rethrow it as it's already logged
		}
	}

	collection(col: "banlists"): Collection<BanList>;
	collection(col: "guilds"): Collection<GuildDBKeys>;
	collection(col: "users"): Collection<UserDBKeys>;
	collection<T = any>(col: string): Collection<T> {
		return this.mdb.collection(col);
	}

	get ready() { return Boolean(this.#connected); /* using Boolean() to make value unchangable */ }
	get connection() { return this.#conn; }
	get mongo() { return this.connection; }
	get mdb() { return this.mongo.db(config.db.botDb); }

	async getUser(id: string): Promise<UserConfig> {
		const start = performance.now();
		let d: UserConfig;
		d = await this.collection("users").findOne({ id }).then(res => !res ? null : new UserConfig(id, res));
		try {
			if (!d) {
				d = await this.collection("users").insertOne({
					...{ ...config.defaults.config.user },
					id
				} as any).then(res => new UserConfig(id, res.ops[0]));
				Logger.info(["Database", "User"], `Created user entry "${id}".`);
			}
		} catch (err) {
			if (err instanceof MongoError) {
				switch (err.code) {
					case 11000: {
						Logger.warn(["Database", "User"], `Duplicate key erro (key: ${id})`);
						return this.getUser(id);
					}

					default: throw err;
				}
			} else throw err;
		}

		const end = performance.now();
		if (config.beta || config.developers.includes(id)) Logger.debug("Database", `Query for the user "${id}" took ${(end - start).toFixed(3)}ms.`);

		return d;
	}

	async getGuild(id: string): Promise<GuildConfig> {
		const start = performance.now();
		let d: GuildConfig;
		d = await this.collection("guilds").findOne({ id }).then(res => !res ? null : new GuildConfig(id, res));
		try {
			if (!d) {
				d = await this.collection("guilds").insertOne({
					...config.defaults.config.guild,
					id
				} as any).then(res => new GuildConfig(id, res.ops[0]));
				Logger.info(["Database", "Guild"], `Created guild entry "${id}".`);
			}
		} catch (err) {
			if (err instanceof MongoError) {
				switch (err.code) {
					case 11000: {
						Logger.warn(["Database", "Guild"], `Duplicate key error (key: ${id})`);
						return this.getGuild(id);
					}

					default: throw err;
				}
			} else throw err;
		}

		const end = performance.now();
		if (config.beta) Logger.debug("Database", `Query for the guild "${id}" took ${(end - start).toFixed(3)}ms.`);

		return d;
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
		const e = crypto.randomBytes(7).toString("hex");
		if (!reason) reason = "None Provided.";
		if (!this.client) Logger.warn("Database", "Missing client on blacklist addition, webhook not executed.");
		else {
			const d = type === "guild" ? await this.client.getUser(id) : await this.client.getUser(id);
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
							...(report ? [`Report: ${report}`] : [])
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

	async checkVote(user: string) {
		const v = await mongo.db("furrybot").collection<Votes.DBLVote>("votes").find({ user }).toArray();

		const e = v.find(e => Date.now() < e.time + 4.32e+7);

		return {
			voted: e,
			weekend: e && e.weekend
		};
	}
}

const db = new Database();
const { mongo, mdb } = db;

export {
	db,
	mongo,
	mdb
};
export default db;
