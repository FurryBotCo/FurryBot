import Yiffy from "./req/Yiffy";
import DankMemerAPI from "./req/DankMemerAPI";
import FurryBot from "../main";
import config from "../config";
import UserConfig from "../db/Models/UserConfig";
import GuildConfig from "../db/Models/GuildConfig";
import { Redis } from "../db";
import { BotFunctions, Colors, Command, CommandError, defaultEmojis, EmbedBuilder, ExtendedMessage } from "core";
import Eris from "eris";
import { Request, ThenReturnType, Time, Utility } from "utilities";
import fetch, { Response } from "node-fetch";
import Logger from "logger";
import Language from "language";
import { APIError, MemeRequestResponse } from "dankmemerapi";
import crypto from "crypto";
import { performance } from "perf_hooks";

export default class LocalFunctions {
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
	static async logError(client: FurryBot, err: Error, type: "message", extra: ExtendedMessage<FurryBot, UserConfig, GuildConfig>): Promise<{
		message: Eris.Message<Eris.TextableChannel>;
		code: string;
	}>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	static async logError(client: FurryBot, err: Error, type: "message" | "event", extra?: ExtendedMessage<FurryBot, UserConfig, GuildConfig> | {}): Promise<{
		message: Eris.Message<Eris.TextableChannel>;
		code: string;
	}> {
		if ([
			1001,
			1006,
			1012,
			"ERR_INVALID_USAGE",
			"Connection reset by peer",
			"Missing Permissions",
			"Missing Access",
			"'tags' conatins a tag that is listed in 'filterTags'"
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
		].some(v => err.message.indexOf(v.toString()) !== -1)) return { message: { embeds: [] } as any, code: "" };

		const d = new Date();
		const code = `err.${config.beta ? "beta" : "prod"}.${crypto.randomBytes(8).toString("hex")}`;
		const p = config.beta ? "`Running in beta, refusing to create a paste.`" : await Request.createPaste(err.stack!, "Furry Bot Error", "1W", 2);
		const e = new EmbedBuilder(config.devLanguage)
			.setTitle("\u274c Error")
			.setTimestamp(d)
			.setColor(Colors.red)
			.setDescription([
				"**Error:**",
				`${defaultEmojis.dot} Stack: ${p}`,
				`${defaultEmojis.dot} Error Name: ${err.name}`,
				`${defaultEmojis.dot} Error Message: ${err.message}`,
				`${defaultEmojis.dot} Code: \`${code || "None"}\``
			].join("\n"));

		switch (type) {
			case "event": {
				e.setDescription([
					e.getDescription(),
					"",
					"**Other Info:**",
					`${defaultEmojis.dot} Time: **${Time.formatDateWithPadding(d)}**`
				].join("\n"));
				break;
			}

			case "message": {
				const v = extra as ExtendedMessage<FurryBot, UserConfig, GuildConfig>;
				const ch = v.channel as Eris.GuildTextableChannel;
				e.setDescription([
					e.getDescription(),
					"",
					"**Other Info:**",
					`${defaultEmojis.dot} Message Content: **${v.content}**`,
					`${defaultEmojis.dot} Message ID: **${v.id}**`,
					`${defaultEmojis.dot} Channel: **${ch.name}**`,
					`${defaultEmojis.dot} Channel ID: **${ch.id}**`,
					`${defaultEmojis.dot} Guild: **${ch.guild.name}**`,
					`${defaultEmojis.dot} Guild ID: **${ch.guild.id}**`,
					`${defaultEmojis.dot} Cluster: **#${client.clusterId}**`,
					`${defaultEmojis.dot} Shard: **#${ch.guild.shard.id}**`,
					`${defaultEmojis.dot} Time: **${Time.formatDateWithPadding(d)}**`
				].join("\n"));
				break;
			}
		}

		const message = await client.w.get("errors")!.execute({
			embeds: [
				e.toJSON()
			]
		});

		return {
			message,
			code
		};
	}

	static calcExp(lvl: number) {
		const k = {
			lvl: lvl < config.leveling.flatRateStart ? lvl * 100 : config.leveling.flatRate,
			total: 0
		};
		if (lvl <= config.leveling.flatRateStart) for (let i = 0; i <= lvl; i++) k.total += i < config.leveling.flatRateStart ? i * 100 : config.leveling.flatRate;
		else {
			const { total: t } = this.calcExp(config.leveling.flatRateStart);
			k.total = t + (lvl - config.leveling.flatRateStart) * config.leveling.flatRate;
		}
		return k;
	}

	static calcLevel(exp: number) {
		let e = Number(exp), lvl = 0, complete = false;
		const { total: t } = this.calcExp(config.leveling.flatRateStart);
		if (exp <= t) {
			while (!complete) {
				const l = this.calcExp(lvl + 1).lvl;
				if (e >= l) {
					e -= l;
					lvl++;
				} else complete = true;
			}
		} else {
			// leftover exp after level 20
			const l = exp - t;
			// leftover exp
			const a = l % config.leveling.flatRate;
			// levels above 20
			const b = Math.floor(l / config.leveling.flatRate);
			lvl = b + config.leveling.flatRateStart;
			e = a;
		}

		return {
			level: lvl,
			total: exp,
			leftover: e,
			needed: this.calcExp(lvl + 1).lvl - e
		};
	}

	static getBlacklistTime(type: keyof typeof config["bl"], amount: number, addOne?: boolean, addTime?: boolean) {
		const d = Date.now();
		if (addOne) amount++;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const t = config.bl[type][amount as 1];
		return !t ? 0 : addTime ? Number(t) + d : t;
	}

	/**
	 * @typedef {object} SpamReport
	 * @param {string} userTag
	 * @param {string} userId
	 * @param {number} generatedTimestamp
	 * @param {("cmd")} type
	 * @param {boolean} beta
	 * @param {object[]} entries
	 * @param {number} entries.time
	 * @param {string} entries.cmd
	 */

	/**
	 * Combine multiple spam reports into one report.
	 *
	 * @static
	 * @param {SpamReport[]} reports
	 * @returns {SpamReport}
	 * @memberof LocalFunctions
	 * @example LocalFunctions.combineReports(<SpamReport[]>);
	 */
	static combineReports(...reports: Array<{
		userTag: string;
		userId: string;
		generatedTimestamp: number;
		type: "cmd";
		beta: boolean;
		entries: Array<{
			time: number;
			cmd: string;
		}>;
	}>): {
			userTag: string;
			userId: string;
			generatedTimestamp: number;
			type: "cmd";
			beta: boolean;
			entries: Array<{
				time: number;
				cmd: string;
			}>;
		} {
		if (Array.from(new Set(reports.map(r => r.userId))).length > 1) throw new TypeError("Cannot combine reports of different users.");
		if (Array.from(new Set(reports.map(r => r.type))).length > 1) throw new TypeError("Cannot combine reports of different types.");
		if (Array.from(new Set(reports.map(r => r.beta))).length > 1) throw new TypeError("Cannot combine beta, and non-beta reports.");

		// eslint-disable-next-line
		const entries: any = Array.from(new Set(reports.map(r => r.entries as any).reduce((a, b) => a.concat(b)).map((r: any) => JSON.stringify(r)))).map(r => JSON.parse(r as string));
		return {
			userTag: reports[0].userTag,
			userId: reports[0].userId,
			generatedTimestamp: Date.now(),
			type: reports[0].type,
			beta: reports[0].beta,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			entries
		};
	}

	static getExt() {
		return __filename.split(".").slice(-1)[0];
	}

	/**
	 * Make a request to api.chewy-bot.top.
	 *
	 * @static
	 * @param {string} cat - The category to fetch from.
	 * @returns {Promise<string>}
	 * @memberof LocalFunctions
	 * @example LocalFunctions.chewyBotAPIRequest("bunny");
	 */
	static async chewyBotAPIRequest(cat: string): Promise<string> {
		let r: Response;
		try {
			r = await fetch(`https://api.chewey-bot.top/${cat}`, {
				method: "GET",
				headers: {
					"User-Agent": config.web.userAgent,
					"Authorization": config.apis.chewyBot
				},
				timeout: 5e3
			});
			return r.text().then(v => {
				try {
					return (JSON.parse(v) as { data: string; }).data;
				} catch (e) {
					return v;
				}
			});
		} catch (e) { // cannot annotate try-catch clauses
			const err = e as Error;
			Logger.error("Request", `${r!.status} ${r!.statusText}`);
			Logger.error("Request", err);
			throw err;
		}
	}

	static randomColor() {
		return Math.floor(Math.random() * 0xFFFFFF);
	}

	static async genericFunCommand(this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>, cmd: Command<FurryBot, UserConfig, GuildConfig>) {
		if (!["wag"].some(v => cmd.triggers.includes(v)) && msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);

		const embed = new EmbedBuilder(msg.gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:${cmd.lang}.possible|${msg.author.id}|${BotFunctions.extraArgParsing(msg)}}`)
			.setTimestamp(new Date().toISOString())
			.setFooter("OwO", config.images.icons.bot)
			.setColor(Colors.furry);

		if (cmd.triggers.includes("bep")) embed.setImage("https://assets.furry.bot/bep.gif");
		if (cmd.triggers.includes("bellyrub")) embed.setImage("https://assets.furry.bot/bellyrub.gif");
		if (cmd.triggers.includes("spray")) embed.setDescription(`${embed.getDescription()!}\n${`<:${config.emojis.custom.spray}>`.repeat(Math.floor(Math.random() * 3) + 2)}`);

		return msg.channel.createMessage({
			embed:
				embed.toJSON()
		});
	}

	static async genericFunCommandWithImage(this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>, cmd: Command<FurryBot, UserConfig, GuildConfig>, type: keyof typeof Yiffy["furry"]) {
		if (![].some(v => cmd.triggers.includes(v)) && msg.args.length < 1)  return new CommandError("INVALID_USAGE", cmd);

		const embed = new EmbedBuilder(msg.gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setDescription(`{lang:${cmd.lang}.possible|${msg.author.id}|${BotFunctions.memeArgParsing(msg)}}`)
			.setTimestamp(new Date().toISOString())
			.setFooter("OwO", config.images.icons.bot)
			.setColor(Colors.furry);

		if (msg.gConfig.settings.commandImages) {
			if (!msg.channel.permissionsOf(this.bot.user.id).has("attachFiles")) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.permissionMissing", ["attachFiles"]));
			// eslint-disable-next-line
			const img = await (Yiffy.furry[type] as typeof Yiffy["furry"]["boop"])("json", 1);
			embed.setImage(img.url);
		}
		return msg.channel.createMessage({
			embed: embed.toJSON()
		});
	}

	static async handleMemeCommand(type: "text" | "image", msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>, cmd: Command<FurryBot, UserConfig, GuildConfig>, override?: string) {
		if (!override) override = cmd.triggers[0];
		return type === "text" ? this.handleTextMemeCommand(override, msg, cmd) : this.handleImageMemeCommand(override, msg, cmd);
	}

	static async handleTextMemeCommand(type: string, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>, cmd: Command<FurryBot, UserConfig, GuildConfig>) {
		if (msg.args.length === 0) return new CommandError("INVALID_USAGE", cmd);
		let res: MemeRequestResponse;
		try {
			// we narrow it to one so it works
			res = await DankMemerAPI[type as "abandon"](BotFunctions.memeArgParsing(msg));
		} catch (e) {
			if (e instanceof APIError) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.dankMemer", [e.message, e.body!.error]));
			else throw e;
		}
		const { ext, file } = res;
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("dankmemer.services", msg.client.bot.user.avatarURL)
				.setColor(Colors.furry)
				.setImage(`attachment://${type}.${ext}`)
				.toJSON()
		}, {
			name: `${type}.${ext}`,
			file
		});
	}

	static async handleImageMemeCommand(type: string, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>, cmd: Command<FurryBot, UserConfig, GuildConfig>) {
		let v: string;
		if (msg.args.length === 0 && msg.attachments.length > 0) v = msg.attachments[0].url;
		else if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(msg.args[0])) v = msg.args[0];
		else {
			const user = msg.args.length === 0 ? msg.author : await msg.getUserFromArgs();
			if (!user) return msg.reply({
				embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER", true)
			});
			v = user.avatarURL;
		}
		let res: MemeRequestResponse;
		try {
			// we narrow it to one so it works
			res = await DankMemerAPI[type as "abandon"](v);
		} catch (e) {
			if (e instanceof APIError) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.dankMemer", [e.message, e.body!.error]));
			else throw e;
		}
		const { ext, file } = res;
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("dankmemer.services", msg.client.bot.user.avatarURL)
				.setColor(Colors.furry)
				.setImage(`attachment://${type}.${ext}`)
				.toJSON()
		}, {
			name: `${type}.${ext}`,
			file
		});
	}


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
		entries: Array<{
			amount: number;
			guild: string;
			user: string;
		}>;
		time: number;
	}> {
		if (!Redis) return { entries: [], time: 0 };
		skipCache = !!skipCache;
		const start = performance.now();
		if (skipCache) void Redis.del("leveling:global-cache");
		const cache = await Redis.get("leveling:global-cache");
		let entries: ThenReturnType<(typeof LocalFunctions)["getHighestLevels"]>["entries"];
		if (!cache) {
			const keys = await Utility.getKeys("leveling:*:*", "0", [], 10000);
			const values = await Redis.mget(keys);
			entries = keys.map((v, i) => ({
				amount: Number(values[i]),
				guild: v.split(":")[1],
				user: v.split(":")[2]
			}));
			await Redis.setex("leveling:global-cache", 3600, JSON.stringify(entries));
		} else {
			try {
				entries = JSON.parse(cache) as typeof entries;
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
}
