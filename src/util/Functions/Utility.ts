import config from "../../config";
import { Languages } from "../Language";
import EmbedBuilder from "../EmbedBuilder";
import Eris from "eris";
import y from "yargs";
import { Colors } from "../Constants";
import Redis from "../Redis";
import { performance } from "perf_hooks";
import FurryBot from "../../main";
import crypto from "crypto";
import Time from "./Time";
import ExtendedMessage from "../ExtendedMessage";
import * as os from "os";

export default class Utility {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * Convert a class to a string format (usually for eval returns).
	 *
	 * @static
	 * @template T - The class' type.
	 * @param {T} d - The class.
	 * @returns {string}
	 * @memberof Utility
	 * @example Utility.toStringFormat(new Error());
	 */
	static toStringFormat<T>(d: T) {
		function format(obj: T, props: string[]) {
			const str: [string, string][] = [] as any;
			for (const p of props) {
				if (obj[p] instanceof Object) {
					let f = false;
					for (const o of config.toStringFormatNames) {
						if (o.test(obj[p])) {
							f = true;
							str.push([p, format(obj[p], o.props)]);
						} else continue;
					}
					if (!f) str.push([p, obj[p].toString()]);
				} else str.push([p, obj[p]]);
			}

			return `<${obj.constructor.name}${str.reduce((a, b) => typeof b[1] === "string" && ["<"].some(j => !b[1].startsWith(j)) ? `${a} ${b[0]}="${b[1]}"` : `${a} ${b[0]}=${b[1]}`, "")}>`;
		}

		for (const o of config.toStringFormatNames) {
			if (o.test(d)) return format(d, o.props);
			else continue;
		}

		return d.toString();
	}

	/**
	 * Generate an error embed.
	 *
	 * @static
	 * @param {Languages} lang - The language for the embed.
	 * @param {("INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL")} type - The type of the embed.
	 * @param {boolean} [json=false] - If json or {@link Eris#EmbedOptions} should be returned.
	 * @returns {string | Eris.EmbedOptions}
	 * @memberof Utility
	 * @example Utility.genErrorEmbed("en", "INVALID_USER");
	 * @example Utility.genErrorEmbed("en", "INVALID_MEMBER", true);
	 */
	static genErrorEmbed(lang: Languages, type: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL", json: true): Eris.EmbedOptions;
	static genErrorEmbed(lang: Languages, type: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL", json?: false): EmbedBuilder;
	static genErrorEmbed(lang: Languages, type: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL", json?: boolean) {
		const e = new EmbedBuilder(lang)
			.setTitle(`{lang:other.errorEmbed.${type}.title}`)
			.setDescription(`{lang:other.errorEmbed.${type}.description}`)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.red);
		return json ? e.toJSON() : e;
	}

	/**
	 * Conver a number into an emoji (single digit only).
	 *
	 * @static
	 * @param {(number | string)} num - The number to convert.
	 * @returns {string}
	 * @memberof Utility
	 * @example Utility.numberToEmoji(1);
	 */
	static numberToEmoji(num: number | string) {
		if (typeof num === "number") num = num.toString();
		const m = {
			0: config.emojis.default.numbers.zero,
			1: config.emojis.default.numbers.one,
			2: config.emojis.default.numbers.two,
			3: config.emojis.default.numbers.three,
			4: config.emojis.default.numbers.four,
			5: config.emojis.default.numbers.five,
			6: config.emojis.default.numbers.six,
			7: config.emojis.default.numbers.seven,
			8: config.emojis.default.numbers.eight,
			9: config.emojis.default.numbers.nine
		};
		Object.keys(m).map(v => num = num.toString().replace(new RegExp(v, "g"), m[v]));
		return num;
	}

	/**
	 * Get the longest string in an array.
	 *
	 * @static
	 * @param {((string | number)[])} arr - The array to check
	 * @returns {(string | number)}
	 * @memberof Utility
	 * @example Utility.getLongestString(["hi", "hello"]);
	 */
	static getLongestString(arr: (string | number)[]) {
		let longest = 0;
		for (const v of arr) if (v.toString().length > longest) longest = v.toString().length;
		return longest;
	}

	/**
	 * @typedef {object} GetPercentsResult
	 * @prop {number} input
	 * @prop {string} percent
	 */

	/**
	 * Convert an array of numbers into percentages.
	 *
	 * @static
	 * @param {number[]} arr - The array to convert.
	 * @returns {GetPercentsResult[]}
	 * @memberof Utility
	 * @example Utility.getPercents([1, 5, 4, 2]);
	 */
	static getPercents(arr: number[]) {
		const total = arr.reduce((a, b) => a + b, 0);
		const a: {
			input: number;
			percent: string;
		}[] = [];
		for (const v of arr) {
			let s = (Math.round(((v / total) * 100) * 10) / 10).toString();
			if (s.indexOf(".") === -1) s = s.padStart(2, "0");
			else s = s.padStart(4, "0");

			s = s.padEnd(4, ".0");
			a.push({
				input: v,
				percent: s
			});
		}
		return a;
	}

	/**
	 * @typedef {object} CompareResult
	 * @prop {boolean} higher
	 * @prop {boolean} same
	 * @prop {boolean} lower
	 */

	/**
	 * @typedef {object} CompareMembersResult
	 * @prop {CompareResult} member1
	 * @prop {CompareResult} member2
	 */

	/**
	 * Compare one member with another.
	 *
	 * @static
	 * @param {Eris.Member} member1 - The first member of the comparison.
	 * @param {Eris.Member} member2 - The second member of the comparison.
	 * @returns {CompareMembersResult}
	 * @memberof Utility
	 * @example Utility.compareMembers(<Member1>, <Member2>);
	 */
	static compareMembers(member1: Eris.Member, member2: Eris.Member) {
		const g = member1.guild;
		const m1r = member1.roles.map(r => g.roles.get(r).position).sort((a, b) => b - a)[0] || 0;
		const m2r = member2.roles.map(r => g.roles.get(r).position).sort((a, b) => b - a)[0] || 0;
		if (member1.id === g.ownerID) return {
			member1: {
				higher: true,
				same: false,
				lower: false
			},
			member2: {
				higher: false,
				same: false,
				lower: true
			}
		};

		if (member2.id === g.ownerID || m1r < m2r) return {
			member1: {
				higher: false,
				same: false,
				lower: true
			},
			member2: {
				higher: true,
				same: false,
				lower: false
			}
		};

		if (m1r > m2r) return {
			member1: {
				higher: true,
				same: false,
				lower: false
			},
			member2: {
				higher: false,
				same: false,
				lower: true
			}
		};

		if (member1.id === member2.id || m1r === m2r) return {
			member1: {
				higher: false,
				same: true,
				lower: false
			},
			member2: {
				higher: false,
				same: true,
				lower: false
			}
		};
	}

	/**
	 * Compare a member with a role.
	 *
	 * @static
	 * @param {Eris.Member} member - The member to compare.
	 * @param {Eris.Role} role - The role to compare.
	 * @returns {CompareResult}
	 * @memberof Utility
	 * @example Utility.compareMemberWithRole(<Member>, <Role>);
	 */
	static compareMemberWithRole(member: Eris.Member, role: Eris.Role) {
		const g = member.guild;
		const mr = member.roles.map(r => g.roles.get(r).position).sort((a, b) => b - a)[0] || 0;

		if (member.id === g.ownerID || mr > role.position) return {
			higher: true,
			same: false,
			lower: false
		};

		if (mr < role.position) return {
			higher: false,
			same: false,
			lower: true
		};

		if (mr === role.position) return {
			higher: false,
			same: true,
			lower: false
		};
	}

	/**
	 * Parse message arguments.
	 *
	 * @static
	 * @template V
	 * @template P
	 * @param {P} args
	 * @returns {object}
	 * @memberof Utility
	 */
	static parseArgs<V extends { [k: string]: any; } = { [k: string]: string | boolean | number; }, P extends (string | string[]) = any>(args: P): {
		args: {
			[K in keyof V]: V[K];
		};
		unused: (string | number | boolean)[];
		provided: P;
	} {
		const v = y.parse(args);
		delete v.$0;
		const a: {
			[K in keyof V]: V[K];
		} = { ...v } as any;
		delete a._;
		return {
			args: a,
			unused: v._,
			provided: args
		};
	}

	/**
	 * Get a member's top role.
	 *
	 * @static
	 * @param {Eris.Member} member - The member to get the top role of.
	 * @param {(role: Eris.Role) => boolean} [filter] - Filter roles.
	 * @returns {Eris.Role}
	 * @memberof Utility
	 * @example Utility.getTopRole(<Member>);
	 * @example Utility.getTopRole(<Member>, (role) => role.id !== "someId");
	 */
	static getTopRole(member: Eris.Member, filter?: (role: Eris.Role) => boolean) {
		if (!filter) filter = () => true;
		return member.roles.map(r => member.guild.roles.get(r)).filter(filter).sort((a, b) => b.position - a.position)[0];
	}

	/**
	 * Get a member's color role.
	 *
	 * @static
	 * @param {Eris.Member} member - The member to get the color role of.
	 * @returns {Eris.Role}
	 * @memberof Utility
	 * @example Utility.getColorRole(<Member>);
	 */
	static getColorRole(member: Eris.Member) {
		return this.getTopRole(member, (role) => role.color !== 0);
	}

	/**
	 * Get keys from Redis.
	 *
	 * Because it came to my attention that I should *not* use KEYS in production.
	 *
	 * @static
	 * @param {string} pattern - The seatch pattern to use.
	 * @param {(number | string)} cur - Internal use only, provide "0".
	 * @param {string[]} [keys] - Internal use only, Provide none or null.
	 * @param {number} [maxPerRun] - The maximum amount of keys to fetch per round.
	 * @returns {Promise<string[]>}
	 * @memberof Utility
	 * @example Utility.getKeys("some:pattern", "0");
	 * @example Utility.getKeys("some:pattern", "0", null, 10000);
	 */
	static async getKeys(pattern: string, cur: number | string, keys?: string[], maxPerRun?: number): Promise<string[]> {
		keys = keys || [];
		maxPerRun = maxPerRun || 10000;
		if (config.beta) return Redis.keys(pattern);
		const s = await Redis.scan(cur, "MATCH", pattern, "COUNT", maxPerRun);
		keys.push(...s[1]);
		if (s[0] !== "0") return this.getKeys(pattern, s[0], keys, maxPerRun);
		else return keys;
	}

	// I could make all of the typedef stuff for the below but I
	// cannot be bothered right now

	/**
	 * Get the highest user levels.
	 *
	 * @static
	 * @param {boolean} [skipCache] - If the cache should be skipped.
	 * @param {("asc" | "desc")} [sort] - The sort order.
	 * @returns {Promise<object>}
	 * @memberof Utility
	 * @example Utility.getHighestLevels();
	 * @example Utility.getHighestLevels(true);
	 * @example Utility.getHighestLevels(true, "asc");
	 */
	static async getHighestLevels(skipCache?: boolean, sort?: "asc" | "desc"): Promise<{
		entries: {
			amount: number;
			guild: string;
			user: string;
		}[];
		time: number;
	}> {
		skipCache = !!skipCache;
		const start = performance.now();
		if (skipCache) Redis.del("leveling:global-cache");
		const cache = await Redis.get("leveling:global-cache");
		let entries: ThenReturnType<(typeof Utility)["getHighestLevels"]>["entries"];
		if (!cache) {
			const keys = await this.getKeys("leveling:*:*", 0, [], 10000);
			const values = await Redis.mget(keys);
			entries = keys.map((v, i) => ({
				amount: Number(values[i]),
				guild: v.split(":")[1],
				user: v.split(":")[2]
			}));
			await Redis.setex("leveling:global-cache", 3600, JSON.stringify(entries));
		} else {
			try {
				entries = JSON.parse(cache);
			} catch (e) {
				return this.getHighestLevels(true);
			}
		}

		entries = entries.sort((a, b) => b.amount - a.amount);
		if (sort === "asc") entries = entries.reverse();
		const end = performance.now();

		return {
			entries,
			time: parseFloat((end - start).toFixed(3))
		};
	}

	/**
	 * @typedef {object} LogErrorResult
	 * @prop {Eris.Message<Eris.TextableChannel>} message
	 * @prop {string} code
	 */

	/**
	 * Log an error
	 *
	 * @static
	 * @param {FurryBot} client - The bot client.
	 * @param {Error} err - The error instance.
	 * @param {("event" | "message")} type - The error type.
	 * @param {any} extra - Extra info to provide.
	 * @returns {LogErrorResult}
	 * @memberof Utility
	 * @example Utility.logError(<Client>, new Error(), "event", {});
	 * @example Utility.logError(<Client>, new Error(), "message", <ExtendedMessage>);
	 */
	// eslint-disable-next-line @typescript-eslint/ban-types
	static async logError(client: FurryBot, err: Error, type: "event", extra: {}): Promise<{
		message: Eris.Message<Eris.TextableChannel>;
		code: string;
	}>;
	static async logError(client: FurryBot, err: Error, type: "message", extra: ExtendedMessage): Promise<{
		message: Eris.Message<Eris.TextableChannel>;
		code: string;
	}>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	static async logError(client: FurryBot, err: Error, type: "message" | "event", extra?: ExtendedMessage | {}): Promise<{
		message: Eris.Message<Eris.TextableChannel>;
		code: string;
	}> {
		if ([1006, 1012, "ERR_INVALID_USAGE", "Connection reset by peer"].some(v => err.message.indexOf(v.toString()) !== -1)) return { message: null, code: "" };

		const d = new Date();
		const code = `err.${config.beta ? "beta" : "prod"}.${crypto.randomBytes(8).toString("hex")}`;
		const p = await client.createPaste(err.stack, "Furry Bot Error", "2D", 1);
		const e = new EmbedBuilder(config.devLanguage)
			.setTitle("\u274c Error")
			.setTimestamp(d)
			.setColor(Colors.red)
			.setDescription([
				"**Error:**",
				`${config.emojis.default.dot} Stack: ${p}`,
				`${config.emojis.default.dot} Error Name: ${err.name}`,
				`${config.emojis.default.dot} Error Message: ${err.message}`,
				`${config.emojis.default.dot} Code: \`${code || "None"}\``
			].join("\n"));

		switch (type) {
			case "event": {
				e.setDescription([
					e.getDescription(),
					"",
					"**Other Info:**",
					`${config.emojis.default.dot} Time: **${Time.formatDateWithPadding(d)}**`
				].join("\n"));
				break;
			}

			case "message": {
				const v = extra as ExtendedMessage;
				e.setDescription([
					e.getDescription(),
					"",
					"**Other Info:**",
					`${config.emojis.default.dot} Message Content: **${v.content}**`,
					`${config.emojis.default.dot} Message ID: **${v.id}**`,
					`${config.emojis.default.dot} Channel: **${v.channel.name}**`,
					`${config.emojis.default.dot} Channel ID: **${v.channel.id}**`,
					`${config.emojis.default.dot} Guild: **${v.channel.guild.name}**`,
					`${config.emojis.default.dot} Guild ID: **${v.channel.guild.id}**`,
					`${config.emojis.default.dot} Cluster: **#${client.clusterId}**`,
					`${config.emojis.default.dot} Shard: **#${v.channel.guild.shard.id}**`,
					`${config.emojis.default.dot} Time: **${Time.formatDateWithPadding(d)}**`
				].join("\n"));
				break;
			}
		}

		const message = await client.w.get("errors").execute({
			embeds: [
				e.toJSON()
			]
		});

		return {
			message,
			code
		};
	}

	/**
	 * Internal use only.
	 *
	 * @static
	 * @template F
	 * @param {F} func
	 * @param {ThisParameterType<F>} thisArg
	 * @param {...Parameters<F>} argArray
	 * @returns {ReturnType<F>}
	 * @memberof Utility
	 */
	static callFunction<F extends (...args: any) => any>(func: F, thisArg: ThisParameterType<F>, ...argArray: Parameters<F>): ReturnType<F> {
		// apparently it can't figure out that argArray is an ARRAY!
		return func.call(thisArg, ...(argArray as any));
	}

	/**
	 * @typedef {object} CPUInfo
	 * @prop {number} idle
	 * @prop {number} total
	 * @prop {number} idleAverage
	 * @prop {number} totalAverage
	 */

	/**
	 * Get info about the CPU.
	 *
	 * @static
	 * @returns {CPUInfo}
	 * @memberof Utility
	 * @example Utility.getCPUInfo();
	 */
	static getCPUInfo() {
		const c = os.cpus();

		let total = 0, idle = 0;

		for (const { times } of c) {
			Object.values(times).map(t => total += t);
			idle += times.idle;
		}

		return {
			idle,
			total,
			idleAverage: (idle / c.length),
			totalAverage: (total / c.length)
		};
	}

	/**
	 * Get CPU Usage.
	 *
	 * @static
	 * @returns {number}
	 * @memberof Utility
	 * @example Utility.getCPUUsage();
	 */
	static async getCPUUsage() {
		const { idleAverage: i1, totalAverage: t1 } = this.getCPUInfo();
		await new Promise((a, b) => setTimeout(a, 1e3));
		const { idleAverage: i2, totalAverage: t2 } = this.getCPUInfo();

		return (10000 - Math.round(10000 * (i2 - i1) / (t2 - t1))) / 100;
	}

	static chooseWeighted<K extends string = string>(values: {
		[k in K]: number;
	}) {
		const items = Object.keys(values);
		let chances: number[] = Object.values(values);
		const sum = chances.reduce((a, b) => a + b, 0);
		let b = 0;
		chances = chances.map(a => (b = a + b));
		const rand = Math.random() * sum;
		return items[chances.filter(el => el <= rand).length] as K;
	}
}
