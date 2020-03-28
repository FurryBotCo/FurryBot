import DB from "@donovan_dmc/db";
import { Db, MongoClientOptions, MongoClient, Collection, MongoError } from "mongodb";
import UserConfig from "../modules/config/UserConfig";
import deasync from "deasync";
import GuildConfig from "../modules/config/GuildConfig";
import config from "../config";
import { Logger } from "../util/LoggerV8";
import Timers from "./Timers";

export default class Database {
	conn: {
		mongo: MongoClient;
		mdb: Db
	};
	debug: boolean;
	constructor(host: string, port: number, database: string, opt: MongoClientOptions, debug?: boolean) {
		this.conn = DB(host, port, database, opt);
		this.debug = !!debug;
	}

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

	async getUser(id: string): Promise<UserConfig>;
	async getUser<F extends (err: Error, d: UserConfig) => any>(id: string, cb: F): Promise<F>;
	async getUser<F extends (err: Error, d: UserConfig) => any>(id: string, cb?: F): Promise<UserConfig | F> {
		const t = new Timers();
		t.start("user");
		let u = await this.collection("users").findOne({ id }).then(res => res ? new UserConfig(id, res) : null);

		if (!u) {
			await this.mdb.collection("users").insertOne({ ...config.defaults.config.user, id }).catch((err: MongoError) => {
				switch (err.code) {
					case 11000: return Logger.warn("Database", `Duplicate key error (key: ${(err as any).keyValue.id})`);
					default:
						return Logger.error("Database", err);
				}
			});
			Logger.debug("Database", `Created user entry "${id}".`);
			u = await this.collection("users").findOne({ id }).then(res => res ? new UserConfig(id, res) : null);
		}
		t.end("user");
		if (this.debug) Logger.debug("Database", `Database query for the user "${id}" took ${t.calc("user", "user")}ms.`);

		if (!cb) return u;
		else return cb(null, u);
	}

	getUserSync(id: string): UserConfig {
		return deasync(this.getUser).call(this, id);
	}

	async getGuild(id: string): Promise<GuildConfig>;
	async getGuild<F extends (err: Error, d: GuildConfig) => any>(id: string, cb: F): Promise<F>;
	async getGuild<F extends (err: Error, d: GuildConfig) => any>(id: string, cb?: F): Promise<GuildConfig | F> {
		const t = new Timers();
		t.start("guild");
		let g = await this.collection("guilds").findOne({ id }).then(res => res ? new GuildConfig(id, res) : null);

		if (!g) {
			// this mess is to set the prefix to the config default instead of what's in the guildConfig defaults
			const t = { ...config.defaults.config.guild };
			delete t.settings;
			await this.mdb.collection("guilds").insertOne({ ...t, settings: { ...config.defaults.config.guild.settings, prefix: config.defaults.prefix }, id }).catch((err: MongoError) => {
				switch (err.code) {
					case 11000: return Logger.warn("Database", `Duplicate key error (key: ${(err as any).keyValue.id})`);
					default:
						return Logger.error("Database", err);
				}
			});
			Logger.debug("Database", `Created guild entry "${id}".`);
			g = await this.collection("guilds").findOne({ id }).then(res => res ? new GuildConfig(id, res) : null);
		}

		t.end("guild");
		if (this.debug) Logger.debug("Database", `Database query for the guild "${id}" took ${t.calc("guild", "guild")}ms.`);

		if (!cb) return g;
		else return cb(null, g);
	}

	getGuildSync(id: string): GuildConfig {
		return deasync(this.getGuild).call(this, id);
	}
}
