import UserConfig, { DBKeys as UserKeys } from "./Models/UserConfig";
import GuildConfig, { DBKeys as GuildKeys } from "./Models/GuildConfig";
import config from "../config";
import Blacklist from "../util/@types/Blacklist";
import FurryBot from "../main";
import { Votes } from "../util/@types/Database";
import { Colors, Database as DB } from "core";
import { MongoError, WithId } from "mongodb";
import Logger from "logger";
import { Strings, Time } from "utilities";
import Eris from "eris";
import crypto from "crypto";
import { performance } from "perf_hooks";
import { isWorker } from "cluster";

// no
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
class Database extends DB {
	static client: FurryBot;
	static async getUser(id: string): Promise<UserConfig> {
		if (mdb === null) throw new ReferenceError("Databse#getUser called before database has been intialized.");
		const start = performance.now();
		let d = await mdb.collection<WithId<UserKeys>>("users").findOne({ id }).then(res => !res ? null : new UserConfig(id, res));
		try {
			if (!d) {
				d = await mdb.collection("users").insertOne({
					...{ ...config.defaults.config.user },
					id
				} as unknown).then(res => new UserConfig(id, res.ops[0]));
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

		return d!;
	}

	static async getGuild(id: string): Promise<GuildConfig> {
		if (mdb === null) throw new ReferenceError("Databse#getGuild called before database has been intialized.");
		const start = performance.now();
		let d = await mdb.collection<WithId<GuildKeys>>("guilds").findOne({ id }).then(res => !res ? null : new GuildConfig(id, res));
		try {
			if (!d) {
				d = await mdb.collection("guilds").insertOne({
					...config.defaults.config.guild,
					id
				} as unknown).then(res => new GuildConfig(id, res.ops[0]));
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

		return d!;
	}

	static async checkBl(type: "guild", guildId: string): Promise<{ [k in "all" | "expired" | "current" | "notice"]: Array<Blacklist.GuildEntry>; }>;
	static async checkBl(type: "user", userId: string): Promise<{ [k in "all" | "expired" | "current" | "notice"]: Array<Blacklist.UserEntry>; }>;
	static async checkBl(type: "guild" | "user", id: string): Promise<{ [k in "all" | "expired" | "current" | "notice"]: Array<Blacklist.GenericEntry>; }> {
		if (mdb === null) throw new ReferenceError("Databse#checkBl called before database has been intialized.");
		const d = Date.now();
		const all = await mdb.collection<Blacklist.GenericEntry>("blacklist").find({ [`${type}Id`]: id }).toArray();
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

	static async addBl(type: "guild", guildId: string, blame: string, blameId: string, reason?: string, expire?: number, report?: string): Promise<WithId<Blacklist.GuildEntry>>;
	static async addBl(type: "user", userId: string, blame: string, blameId: string, reason?: string, expire?: number, report?: string): Promise<WithId<Blacklist.UserEntry>>;
	static async addBl(type: "guild" | "user", id: string, blame: string, blameId: string, reason?: string, expire?: number, report?: string) {
		if (mdb === null) throw new ReferenceError("Databse#addBl called before database has been intialized.");
		const e = crypto.randomBytes(7).toString("hex");
		if (!reason) reason = "None Provided.";
		if (!this.client) Logger.warn("Database", "Missing client on blacklist addition, webhook not executed.");
		else {
			const d = type === "guild" ? await this.client.getGuild(id) : await this.client.getUser(id);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const prev = type === "guild" ? await this.getGuild(id).then(g => g.checkBlacklist().then(b => b.all.length)) : await this.getUser(id).then(u => u.checkBlacklist().then(b => b.all.length));
			await this.client.w.get("blacklist")!.execute({
				embeds: [
					{
						title: `${Strings.ucwords(type)} Blacklisted`,
						description: [
							`${Strings.ucwords(type)} Id: ${id}`,
							`Entry ID: ${e}`,
							`${d instanceof Eris.Guild ? `Name: ${d.name}` : `Tag: ${d!.username}#${d!.discriminator}`}`,
							`Reason: ${reason}`,
							`Blame: ${blame} (${blameId})`,
							// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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

	static async checkVote(user: string) {
		if (mongo === null) throw new ReferenceError("Databse#checkVote called before database has been intialized.");
		const v = await mongo.db("furrybot").collection<Votes.AnyVote>("votes").find({ user }).toArray();

		const e = v.find(j => Date.now() < j.time + 4.32e+7);

		return {
			voted: e,
			weekend: e && "weekend" in e && e.weekend === true
		};
	}
}

if (isWorker) {
	switch (process.env.TYPE) {
		case "CLUSTER": {
			Database.init({
				host: config.services.db.host,
				port: config.services.db.port,
				options: config.services.db.options,
				main: config.services.db[config.beta ? "dbBeta" : "db"]
			}, {
				host: config.services.redis.host,
				port: config.services.redis.port,
				password: config.services.redis.password,
				db: config.services.redis[config.beta ? "dbBeta" : "db"],
				name: `FurryBot${config.beta ? "Beta": ""}`
			});
			break;
		}

		case "SERVICE": {
			switch (process.env.NAME) {
				case "auto-posting":
				case "mod": {
					Database.initDb({
						host: config.services.db.host,
						port: config.services.db.port,
						options: config.services.db.options,
						main: config.services.db[config.beta ? "dbBeta" : "db"]
					});
					break;
				}

				case "stats": {
					Database.initRedis({
						host: config.services.redis.host,
						port: config.services.redis.port,
						password: config.services.redis.password,
						db: config.services.redis[config.beta ? "dbBeta" : "db"],
						name: `FurryBot${config.beta ? "Beta": ""}`
					});
					break;
				}
			}
			break;
		}

		default: throw new TypeError("invalid TYPE in process env.");
	}
} else {
	if (process.env.ENABLE_DB === "1") {
		Database.initDb({
			host: config.services.db.host,
			port: config.services.db.port,
			options: config.services.db.options,
			main: config.services.db[config.beta ? "dbBeta" : "db"]
		});
	}

	if (process.env.ENABLE_REDIS === "1") {
		Database.initRedis({
			host: config.services.redis.host,
			port: config.services.redis.port,
			password: config.services.redis.password,
			db: config.services.redis[config.beta ? "dbBeta" : "db"],
			name: `FurryBot${config.beta ? "Beta": ""}`
		});
	}
}


export const db = Database;
export const mdb = Database.dbReady ? Database.mdb : null;
export const mongo = Database.dbReady ? Database.mongo : null;
export const Redis = Database.redisReady ? Database.Redis : null;
export default Database;
