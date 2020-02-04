import config from "../../config";
import { mdb, db } from "../../modules/Database";
import { Blacklist } from "../@types/Misc";
import * as os from "os";
import FurryBot from "@FurryBot";
import loopPatrons from "../patreon/loopPatrons";
import refreshPatreonToken from "../patreon/refreshPatreonToken";
import GuildConfig from "../../modules/config/GuildConfig";
import Eris from "eris";
import { Request, Utility, Time, Strings } from ".";
import Logger from "../LoggerV8";

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
	static get getUser() { return db.getUser.bind(db); }
	/**
	 * get a user from the database (synchronous)
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getUserSync() { return db.getUserSync.bind(db); }
	/**
	 * get a guild from the database
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getGuild() { return db.getGuild.bind(db); }
	/**
	 * get a guild from the database (synchronous)
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getGuildSync() { return db.getGuildSync.bind(db); }

	static get loopPatrons() { return loopPatrons; }
	static get refreshPatreonToken() { return refreshPatreonToken; }

	/**
	 * Run auto content systems
	 * @static
	 * @param {number} time
	 * @param {FurryBot} client
	 * @memberof Internal
	 */
	static async runAuto(time: number, client: FurryBot) {
		const guilds = await mdb
			.collection("guilds")
			.find<GuildConfig>({})
			.toArray()
			.then(g =>
				g.filter(k => k.auto && k.auto.length > 0)
			);

		const counter = {
			gay: 0,
			straight: 0,
			lesbian: 0,
			dickgirl: 0
		};
		for (const g of guilds) for (const w of g.auto.filter(a => a.time === (time / 6e4))) {
			switch (w.type.toLowerCase() as typeof w.type) {
				case "yiff": {
					const img = await Request.imageAPIRequest(false, `yiff/${w.cat}`, true, false);
					const embed: Eris.EmbedOptions = {
						title: "Auto Yiff",
						color: Math.floor(Math.random() * 0xFFFFFF),
						timestamp: new Date().toISOString(),
						footer: {
							text: `Disable this using "${g.settings.prefix}auto yiff disable ${w.cat}" (without quotes)`
						}
					};
					if (img.success !== true) embed.description = `API Error encountered while fetching image.\nCode: ${img.error.code} \nDescription: \`${img.error.description}\`\nReport this to my [support server](${config.bot.supportInvite})`;
					else {
						const short = await Utility.shortenURL(img.response.image);
						embed.description = `Type: ${w.cat}\nShort URL: ${short.link}`;
						embed.image = {
							url: img.response.image
						};
					}

					await client.executeWebhook(w.webhook.id, w.webhook.token, {
						embeds: [
							embed
						]
					}).then(() => counter[w.cat]++);
					break;
				}

				default:
					Logger.error("Auto", `unknown type "${w.type.toLowerCase()}"`);
			}
		}

		Logger.debug("Auto", `${time / 6e4}m Processed\nTotal Ran:\n${Object.keys(counter).map(k => `${Strings.ucwords(k)}: ${counter[k]}`).join("\n")}`);
	}
}
