import config from "../../config";
import { mdb, db } from "../../modules/Database";
import { Blacklist } from "../@types/Misc";
import * as os from "os";
import FurryBot from "@FurryBot";

export default class Internal {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	static async fetchBlacklistEntries(id: string, type: "guild"): Promise<{
		current: Blacklist.GuildEntry[];
		past: Blacklist.GuildEntry[];
		active: boolean;
	}>;
	static async fetchBlacklistEntries(id: string, type: "user"): Promise<{
		current: Blacklist.UserEntry[];
		past: Blacklist.UserEntry[];
		active: boolean;
	}>;
	/**
	 * fetches blacklist entries for users/guilds
	 * @static
	 * @param {string} id - the user or guild id
	 * @param {("guild" | "user")} type - the type, user or guild
	 * @returns {Promise<any>}
	 * @memberof Internal
	 */
	static async fetchBlacklistEntries(id: string, type: "guild" | "user") {
		if (!["guild", "user"].includes(type.toLowerCase())) throw new TypeError("Invalid type.");

		if (type.toLowerCase() === "guild") {
			const b: Blacklist.GuildEntry[] = await mdb.collection("blacklist").find({ guildId: id }).toArray();

			if (b.length === 0) return {
				current: [],
				past: [],
				active: false
			};
		} else {
			const b: Blacklist.UserEntry[] = await mdb.collection("blacklist").find({ userId: id }).toArray();

			if (b.length === 0) return {
				current: [],
				past: [],
				active: false
			};
		}
	}
	/**
	 * memory info
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get memory() {
		return {
			process: {
				/**
				 * process total memory
				 * @returns {number}
				 */
				getTotal: (() => process.memoryUsage().heapTotal),
				/**
				 * process used memory
				 * @returns {number}
				 */
				getUsed: (() => process.memoryUsage().heapUsed),
				/**
				 * process rss memory
				 * @returns {number}
				 */
				getRSS: (() => process.memoryUsage().rss),
				/**
				 * process external memory
				 * @returns {number}
				 */
				getExternal: (() => process.memoryUsage().external),
				/**
				 * process memory usage
				 * @returns {T.ProcessMemory}
				 */
				getAll: (() => ({
					total: process.memoryUsage().heapTotal,
					used: process.memoryUsage().heapUsed,
					rss: process.memoryUsage().rss,
					external: process.memoryUsage().external
				}))
			},
			system: {
				/**
				 * system total memory
				 * @returns {number}
				 */
				getTotal: (() => os.totalmem()),
				/**
				 * system used memory
				 * @returns {number}
				 */
				getUsed: (() => os.totalmem() - os.freemem()),
				/**
				 * system free memory
				 * @returns {number}
				 */
				getFree: (() => os.freemem()),
				/**
				 * system memory usage
				 * @returns {T.SystemMemory}
				 */
				getAll: (() => ({
					total: os.totalmem(),
					used: os.totalmem() - os.freemem(),
					free: os.freemem()
				}))
			}
		};
	}

	/**
	 *
	 * @static
	 * @param {any[]} reports
	 * @returns {any}
	 * @memberof Internal
	 */
	static combineReports(...reports: {
		userTag: string;
		userId: string;
		generatedTimestamp: number;
		type: "cmd" | "response";
		beta: boolean;
		entries: {
			time: number;
			cmd: string;
		}[] | {
			time: number;
			response: string;
		}[];
	}[]): {
		userTag: string;
		userId: string;
		generatedTimestamp: number;
		type: "cmd" | "response";
		beta: boolean;
		entries: {
			time: number;
			cmd: string;
		}[] | {
			time: number;
			response: string;
		}[];
	} {
		if (Array.from(new Set(reports.map(r => r.userId))).length > 1) throw new TypeError("Cannot combine reports of different users.");
		if (Array.from(new Set(reports.map(r => r.type))).length > 1) throw new TypeError("Cannot combine reports of different types.");
		if (Array.from(new Set(reports.map(r => r.beta))).length > 1) throw new TypeError("Cannot combine beta, and non-beta reports.");

		const entries: any = Array.from(new Set(reports.map(r => r.entries as any).reduce((a, b) => a.concat(b)).map(r => JSON.stringify(r)))).map(r => JSON.parse(r as string));
		return {
			userTag: reports[0].userTag,
			userId: reports[0].userId,
			generatedTimestamp: Date.now(),
			type: reports[0].type,
			beta: reports[0].beta,
			entries
		};
	}

	/**
	 * Increment or decrement the daily guild join counter
	 * @static
	 * @param {boolean} [increment=true]
	 * @returns {Promise<number>}
	 * @memberof Internal
	 */
	static async incrementDailyCounter(increment = true): Promise<number> {
		const d = new Date();
		const id = `${d.getMonth()}-${d.getDate()}-${d.getFullYear()}`;

		const j = await mdb.collection("dailyjoins").findOne({ id });
		const count = j ? increment ? j.count + 1 : j.count - 1 : increment ? -1 : 1;
		await mdb.collection("dailyjoins").findOneAndDelete({ id });
		await mdb.collection("dailyjoins").insertOne({ count, id });

		return count;
	}

	/**
	 * check if a user is a booster
	 *
	 * will fail if the main guild is not present
	 * @static
	 * @param {string} userId - the users id
	 * @param {FurryBot} client - the bot client
	 * @returns
	 * @memberof Internal
	 */
	static async checkBooster(userId: string, client: FurryBot) {
		const g = client.guilds.get(config.bot.mainGuild);
		if (!g) return false;
		if (!g.members.has(userId)) return false;
		else {
			const m = g.members.get(userId);
			return m.roles.includes(config.nitroBoosterRole);
		}
	}

	/**
	 * get a user from the database
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getUser() { return db.getUser; }
	/**
	 * get a user from the database (synchronous)
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getUserSync() { return db.getUserSync; }
	/**
	 * get a guild from the database
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getGuild() { return db.getGuild; }
	/**
	 * get a guild from the database (synchronous)
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getGuildSync() { return db.getGuildSync; }
}
