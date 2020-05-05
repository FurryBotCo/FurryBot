import DB from "@donovan_dmc/db";
import { Db, MongoClientOptions, MongoClient, Collection, MongoError } from "mongodb";
import UserConfig from "../modules/config/UserConfig";
import deasync from "deasync";
import GuildConfig from "../modules/config/GuildConfig";
import config from "../config";
import Timers from "./Timers";
import FurryBot from "../main";
import { Internal } from "./Functions";
import Logger from "./LoggerV8";
import rClient from "./Redis";

export default class Database {
	conn: {
		mongo: MongoClient;
		mdb: Db
	};
	debug: boolean;
	client: FurryBot;
	constructor(host: string, port: number, database: string, opt: MongoClientOptions, debug?: boolean) {
		this.conn = DB(host, port, database, opt);
		this.debug = !!debug;
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
	async getUser<F extends (err: Error, d: UserConfig) => any>(id: string, skipCache: boolean, cb: F): Promise<F>;
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
			await rClient.SETEX(`${config.beta ? "beta" : "prod"}:db:uConfig:${id}`, 60, JSON.stringify(u));
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

	getUserSync(id: string, skipCache?: boolean): UserConfig {
		return deasync(this.getUser).call(this, id, skipCache);
	}

	async getGuild(id: string, skipCache?: boolean): Promise<GuildConfig>;
	async getGuild<F extends (err: Error, d: GuildConfig) => any>(id: string, skipCache: boolean, cb: F): Promise<F>;
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
			await rClient.SETEX(`${config.beta ? "beta" : "prod"}:db:gConfig:${id}`, 60, JSON.stringify(g));
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

	getGuildSync(id: string, skipCache?: boolean): GuildConfig {
		return deasync(this.getGuild).call(this, id, skipCache);
	}
}
