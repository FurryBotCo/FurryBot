/// <reference path="../@types/global.d.ts" />
import * as os from "os";
import { mdb } from "../../modules/Database";
import config from "../../config";
import Eris from "eris";
import ExtendedMessage from "../../modules/ExtendedMessage";
import phin from "phin";
import loopPatrons from "../patreon/loopPatrons";
import refreshPatreonToken from "../patreon/refreshPatreonToken";
import { Time } from ".";
import { Redis } from "../../modules/External";
import { Worker } from "worker_threads";
import FurryBot from "../../main";

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

	static get loopPatrons() { return loopPatrons; }
	static get refreshPatreonToken() { return refreshPatreonToken; }

	static sanitize(str: string) {
		if (typeof str !== "string") str = (str as any).toString();
		["*", "_", "@"].map(s => str = str.replace(new RegExp(`\\${s}`, "gi"), `\\${s}`));
		return str;
	}

	static formatWelcome(str: string, user: Eris.User, guild: Eris.Guild) {
		const d = new Date(user.createdAt);
		const f = {
			"user.username": user.username,
			"user.discriminator": user.discriminator,
			"user.tag": `${user.username}#${user.discriminator}`,
			"user.id": user.id,
			"user.mention": `<@!${user.id}>`,
			"user.creationAgo": Time.formatAgo(d),
			"user.creationUS": `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear}`,
			"user.creationUK": `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear}`,
			"user.creationISO": `${d.getFullYear}-${d.getMonth() + 1}-${d.getDate()}`,
			"server.name": guild.name,
			"server.id": guild.id
		};

		Object.keys(f).map(k => str = str.replace(new RegExp(`\\{${k}\\}`, "g"), f[k]));

		return str;
	}

	static extraArgParsing<M extends ExtendedMessage<Eris.TextableChannel> = ExtendedMessage<Eris.GuildTextableChannel>>(msg: M) {
		let str = msg.args.join(" ");
		try {
			str
				.match(new RegExp("[0-9]{17,18}", "g"))
				.filter(k => !str.split(" ")[str.split(" ").indexOf(k)].match(new RegExp("<@!?[0-9]{17,18}>")) || msg.channel.guild.members.has(k))
				.map(k => str = str.replace(k, `<@!${k}>`));

		} catch (e) { }
		str
			.split(" ")
			.filter(k => !k.match(new RegExp("<@!?[0-9]{17,18}>", "i")) && k.length >= 3)
			.map(k => {
				let m: Eris.Member;
				if (k.indexOf("#") !== -1) m = msg.channel.guild.members.filter(u => (`${u.username}#${u.discriminator}`).toLowerCase() === k.toLowerCase())[0];
				else m = msg.channel.guild.members.filter(u => u.username.toLowerCase() === k.toLowerCase() || (u.nick && u.nick.toLowerCase() === k.toLowerCase()))[0];

				if (!!m) str = str.replace(k, `<@!${m.id}>`);
			});

		return str;
	}

	static async authorizeOAuth(code: string): Promise<Discord.Oauth2Token> {
		const c = await phin<Discord.Oauth2Token>({
			method: "POST",
			url: "https://discordapp.com/api/oauth2/token",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			form: {
				client_id: config.client.id,
				client_secret: config.client.secret,
				grant_type: "authorization_code",
				code,
				redirect_uri: config.web.oauth2.redirectURL,
				scope: config.web.oauth2.scopes.join(" ")
			},
			parse: "json"
		});

		if (c.statusCode === 200) return c.body;
		else throw new Error(JSON.stringify(c.body));
	}

	static async getSelfUser(auth: string) {
		const p = await phin<Discord.APISelfUser>({
			method: "GET",
			url: "https://discordapp.com/api/v7/users/@me",
			headers: {
				Authorization: `Bearer ${auth}`
			},
			parse: "json"
		});
		return p.statusCode !== 200 ? null : p.body;
	}

	static async fetchRedisKey(key: string) {
		return new Promise<string>((a, b) => Redis.GET(key, (err, reply) => !err ? a(reply) : b(err)));
	}

	static async getStats() {
		const statNames = [
			`${config.beta ? "beta" : "prod"}:stats:commandsTotal`,
			`${config.beta ? "beta" : "prod"}:stats:commandsAllTime`,
			`${config.beta ? "beta" : "prod"}:stats:messages`,
			`${config.beta ? "beta" : "prod"}:events:messageCreate`,
			`${config.beta ? "beta" : "prod"}:stats:directMessage`,
			`${config.beta ? "beta" : "prod"}:stats:uptime`
		];

		return Promise.all<{
			commandsTotal?: number;
			commandsAllTime?: number;
			messages?: number;
			messageCreate?: number;
			directMessage?: number;
			uptime?: number;
		}>(statNames.map(async (s) => ({ [s.split(":").slice(-1)[0]]: await this.fetchRedisKey(s).then(k => k !== null ? Number(k) : null) }))).then(s => s.reduce((a, b) => ({ ...a, ...b }), {}));
	}

	static async incrementDailyCounter(client: FurryBot, incr: boolean) {
		const d = new Date();
		const id = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
		const j = await mdb.collection("dailyjoins").findOne({ id });
		if (!j) await mdb.collection("dailyjoins").insertOne({ id, count: 0 });
		const count = (!j || !j.count ? j.count : 0) + (incr ? 1 : -1);
		await mdb.collection("dailyjoins").findOneAndUpdate({
			id
		}, {
			$set: {
				count,
				guildCount: client.guilds.size
			}
		});
		return count;
	}

	static emojiStringToId(e: string) {
		return e.match("<:([a-zA-Z]{2,}:[0-9]{15,21})>")[1];
	}
}
