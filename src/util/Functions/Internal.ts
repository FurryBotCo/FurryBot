/// <reference path="../@types/Discord.d.ts" />
/* eslint-disable @typescript-eslint/ban-types */

import Category from "../cmd/Category";
import path from "path";
import Command from "../cmd/Command";
import * as fs from "fs-extra";
import * as os from "os";
import ExtendedMessage from "../ExtendedMessage";
import Eris from "eris";
import phin from "phin";
import config from "../../config";
import { execSync } from "child_process";
import Language, { Languages } from "../Language";
import JSON5 from "json5";
import ts from "typescript";

export default class Internal {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * Merge objects for configuration purposes.
	 *
	 * @static
	 * @param {object} a - The object to put the properties on.
	 * @param {object} b - The provided data.
	 * @param {object} c - The default data.
	 * @returns
	 * @memberof Internal
	 * @example Internal.goKeys(Object1, Object2, Object3);
	 */
	static goKeys(a: object, b: object, c: object): void {
		// cloning because we don't want to edit the original defaults
		// using this dirty method because spread leaves a deep reference
		const d = JSON.parse(JSON.stringify(c));
		const obj = Object.keys(d).length === 0 ? b : d;
		if (a.id) d.id = a.id; // tslint:disable-line no-string-literal
		Object.keys(obj).map(k => {
			if (typeof d[k] === "object" && d[k] !== null) {
				if (d[k] instanceof Array) a[k] = [undefined, null, ""].includes(b[k]) ? d[k] : b[k];
				else {
					if ([undefined, null, ""].includes(a[k])) a[k] = d[k];
					if (![undefined, null, ""].includes(b[k])) return this.goKeys(a[k], b[k], d[k]);
				}
			} else return a[k] = [undefined].includes(b[k]) ? d[k] : b[k];
		});
	}

	/**
	 * Load commands in a directory into a category.
	 *
	 * @static
	 * @param {string} dir - The directory to laod from.
	 * @param {Category} cat - The category to add on to.
	 * @memberof Internal
	 * @example Internal.loadCommands("/opt/FurryBot/src/commands/developer", <Category>);
	 */
	static loadCommands(dir: string, cat: Category) {
		const ext = __filename.split(".").slice(-1)[0];
		fs.readdirSync(dir).filter(f => !fs.lstatSync(`${dir}/${f}`).isDirectory() && f.endsWith(ext) && f !== `index.${ext}`).map(f => {
			let c = require(`${dir}/${f}`);
			if (c.default) c = c.default;
			if (c instanceof Command) cat.addCommand(c);
			else throw new TypeError(`Invalid command in file "${path.resolve(`${dir}/${f}`)}"`);
		});
	}

	/**
	 * Extra argument parsing for some commands.
	 *
	 * @static
	 * @param {ExtendedMessage} msg - The message instance.
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.extraArgParsing(<ExtendedMessage>);
	 */
	static extraArgParsing(msg: ExtendedMessage) {
		let str = msg.args.join(" ");
		try {
			str
				.match(new RegExp("[0-9]{16,21}", "g"))
				.filter(k => !str.split(" ")[str.split(" ").indexOf(k)].match(new RegExp("<@!?[0-9]{16,21}>")) || msg.channel.guild.members.has(k))
				.map(k => str = str.replace(k, `<@!${k}>`));

		} catch (e) { }
		str
			.split(" ")
			.filter(k => !k.match(new RegExp("<@!?[0-9]{16,21}>", "i")) && k.length >= 3)
			.map(k => {
				let m: Eris.Member;
				if (k.indexOf("#") !== -1) m = msg.channel.guild.members.filter(u => (`${u.username}#${u.discriminator}`).toLowerCase() === k.toLowerCase())[0];
				else m = msg.channel.guild.members.filter(u => u.username.toLowerCase() === k.toLowerCase() || (u.nick && u.nick.toLowerCase() === k.toLowerCase()))[0];

				if (m) str = str.replace(k, `<@!${m.id}>`);
			});

		return str;
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
	 * @memberof Internal
	 * @example Internal.combineReports(<SpamReport[]>);
	 */
	static combineReports(...reports: {
		userTag: string;
		userId: string;
		generatedTimestamp: number;
		type: "cmd";
		beta: boolean;
		entries: {
			time: number;
			cmd: string;
		}[];
	}[]): {
			userTag: string;
			userId: string;
			generatedTimestamp: number;
			type: "cmd";
			beta: boolean;
			entries: {
				time: number;
				cmd: string;
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
	 * Authorize with Discord's OAuth.
	 *
	 * @static
	 * @param {string} code - The code of the authorization.
	 * @param {string} [redirectURL] - The redirect URL used.
	 * @returns {Promise<Discord.Oauth2Token>}
	 * @memberof Internal
	 * @example Internal.authorizeOAuth("someCodeFromDiscord");
	 * @example Internal.authorizeOAuth("someCodeFromDiscord", "https://example.com");
	 */
	static async authorizeOAuth(code: string, redirectURL?: string): Promise<Discord.Oauth2Token> {
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
				redirect_uri: redirectURL || config.web.oauth2.redirectURL,
				scope: config.web.oauth2.scopes.join(" ")
			},
			parse: "json"
		});

		if (c.statusCode === 200) return c.body;
		else throw new Error(JSON.stringify(c.body));
	}

	/**
	 * Get the user behind a Discord authorization token.
	 *
	 * @static
	 * @param {string} auth - The bearer token.
	 * @returns
	 * @memberof Internal
	 * @example Internal.getSelfUser("discordBearerToken");
	 */
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

	/**
	 * Sanitize text to replace certain characters
	 *
	 * @static
	 * @param {string} str - The string to sanitize.
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.sanitize("Some (at)everyone text here");
	 */
	static sanitize(str: string) {
		if (typeof str !== "string") str = (str as any).toString();
		["*", "_", "@"].map(s => str = str.replace(new RegExp(`\\${s}`, "gi"), `\\${s}`));
		return str;
	}

	/**
	 * Sanitize console output to remove special characters.
	 *
	 * @static
	 * @param {string} str - The string to sanitize-
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.consoleSanitize("someString");
	 */
	static consoleSanitize(str: string) {
		if (typeof str !== "string") str = (str as any).toString();
		return str.replace(/\u001B\[[0-9]{1,2}m/g, "");
	}

	/**
	 * Get the number of days in a given month.
	 *
	 * Not zero based.
	 *
	 * @static
	 * @param {number} month
	 * @returns {number}
	 * @memberof Internal
	 * @example Internal.getDaysInMonth(2);
	 */
	static getDaysInMonth(month: number) {
		return new Date(new Date().getFullYear(), month, 0).getDate();
	}


	/**
	 * Get the paid time for a dollar amount.
	 *
	 * @static
	 * @param {("db" | "main")} type - The type we're calculating for.
	 * @param {number} amount - The amount we're calculating for.
	 * @param {number} [month] - The month we're calculating for. (Zero based)
	 * @returns
	 * @memberof Internal
	 * @example Internal.getPaidTime("db", 3);
	 * @example Internal.getPaidTime("db", 5, 1);
	 * @example Internal.getPaidTime("main", 7);
	 * @example Internal.getPaidTime("main", 10, 4);
	 */
	static getPaidTime(type: "db" | "main", amount: number, month?: number) {
		month = month ?? new Date().getMonth() + 1;
		const PRICE_DB = 25;
		const PRICE_MAIN = 20;
		const DAYS = this.getDaysInMonth(month);
		const HOURLY = type === "db" ? PRICE_DB / DAYS : PRICE_MAIN / DAYS;

		return ((Math.ceil((amount / HOURLY) * 10 / 5) * 5) / 10) * 24 * 60 * 60 * 1000;
	}

	/**
	 * @typedef {object} DiskUsage
	 * @prop {Object.<string, DUsage>} drives
	 * @prop {boolean} unix
	 */

	/**
	 * @typedef {object} DUsage
	 * @prop {number} total
	 * @prop {number} free
	 */

	/**
	 * Get the local disk usage.
	 *
	 * @static
	 * @returns {DiskUsage}
	 * @memberof Internal
	 * @example Internal.getDiskUsage()
	 */
	static getDiskUsage() {
		// UNIX = df -Pk "/"
		// WINDOWS = wmic logicaldisk get size,freespace,caption

		const drives: {
			[k: string]: {
				total: number;
				free: number;
			};
		} = {};
		const unix = process.platform !== "win32";
		const out = execSync(unix ? "df -Pk \"/\"" : "wmic logicaldisk get size,freespace,caption")
			.toString()
			.split(os.EOL)
			.slice(1)
			.map(v => v.trim().split(/\s+(?=[\d/])/))
			.filter(v => v.length > 0 && v[0] !== "");

		for (const line of out) {
			if (unix) drives[line[5]] = {
				free: Number(line[3]) * 1024,
				total: Number(line[1]) * 1024
			}; else drives[line[0]] = {
				free: Number(line[1]),
				total: Number(line[2])
			};
		}

		return {
			drives,
			unix
		};
	}

	/**
	 * Generate a tooltip for an embed.
	 *
	 * @static
	 * @param {Languages} lang - The language of the tooltip.
	 * @param {string} text - The title of the tooltip.
	 * @param {string} content - The content of the tooltip.
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.genTooltip("en", "Test Test", "Test Content");
	 */
	static genTooltip(lang: Languages, text: string, content: string) {
		const ct = Language.parseString(lang, content);
		return `[${Language.parseString(lang, text)}](https://botapi.furry.bot/note/show?content=${encodeURIComponent(ct)} '${ct}')`;
	}

	/**
	 * Get our tsconfig file in a json format.
	 *
	 * @static
	 * @param {(string | null)} [file] - A file to read from.
	 * @returns {ts.TranspileOptions}
	 * @memberof Internal
	 * @example Internal.getTSConfig();
	 * @example Internal.getTSConfig("/opt/FurryBot/tsconfig.json");
	 */
	static getTSConfig(file?: string | null) {
		if (!file) file = `${config.dir.base}/tsconfig.json`;
		const c = JSON5.parse(fs.readFileSync(file).toString());
		return {
			...c,
			compilerOptions: {
				...c.compilerOptions,
				target: ts.ScriptTarget.ESNext,
				moduleResolution: ts.ModuleResolutionKind.NodeJs,
				module: ts.ModuleKind.CommonJS,
				lib: [
					"lib.es2015.d.ts",
					"lib.es2016.d.ts",
					"lib.es2017.d.ts",
					"lib.es2018.d.ts",
					"lib.es2019.d.ts",
					"lib.es2020.d.ts",
					"lib.esnext.d.ts"
				]
			}
		} as ts.TranspileOptions;
	}

	/**
	 * Transpile a single file, returning the transpiled contents.
	 *
	 * @static
	 * @param {string} mod - The code to transpile
	 * @param {(ts.TranspileOptions | string)} [tsconfig] - the tsconfig to use
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.transpile(fs.readFileSync("/opt/FurryBot/index.ts"));
	 * @example Internal.transpile(fs.readFileSync("/opt/FurryBot/index.ts"), "/opt/FurryBot/tsconfig.json");
	 */
	static transpile(mod: string, tsconfig?: ts.TranspileOptions | string) {
		const cnf = typeof tsconfig === "object" ? tsconfig : this.getTSConfig(tsconfig || null);

		return ts.transpileModule(mod, cnf).outputText;
	}
}
