/// <reference path="../@types/Discord.d.ts" />
import Category from "../cmd/Category";
import path from "path";
import Command from "../cmd/Command";
import * as fs from "fs-extra";
import * as os from "os";
import ExtendedMessage from "../ExtendedMessage";
import Eris from "eris";
import phin from "phin";
import config from "../../config";

export default class Internal {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * Merge objects for configuration purposes
	 * @static
	 * @param {object} a - The object to put the properties on
	 * @param {object} b - The provided data
	 * @param {object} c - The default data
	 * @returns
	 * @memberof Functions
	 */
	static goKeys(a: object, b: object, c: object): void {
		const obj = Object.keys(c).length === 0 ? b : c;
		Object.keys(obj).map(k => {
			if (typeof c[k] === "object" && c[k] !== null) {
				if (c[k] instanceof Array) a[k] = [undefined, null, ""].includes(b[k]) ? c[k] : b[k];
				else {
					if ([undefined, null, ""].includes(a[k])) a[k] = c[k];
					if (![undefined, null, ""].includes(b[k])) return this.goKeys(a[k], b[k], c[k]);
				}
			} else return a[k] = [undefined].includes(b[k]) ? c[k] : b[k];
		});
	}

	static loadCommands(dir: string, cat: Category) {
		const ext = __filename.split(".").slice(-1)[0];
		fs.readdirSync(dir).filter(f => !fs.lstatSync(`${dir}/${f}`).isDirectory() && f.endsWith(ext) && f !== `index.${ext}`).map(f => {
			let c = require(`${dir}/${f}`);
			if (c.default) c = c.default;
			if (c instanceof Command) cat.addCommand(c);
			else throw new TypeError(`Invalid command in file "${path.resolve(`${dir}/${f}`)}"`);
		});
	}

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

	static async getCPUUsage() {
		const { idleAverage: i1, totalAverage: t1 } = this.getCPUInfo();
		await new Promise((a, b) => setTimeout(a, 1e3));
		const { idleAverage: i2, totalAverage: t2 } = this.getCPUInfo();

		return (10000 - Math.round(10000 * (i2 - i1) / (t2 - t1))) / 100;
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

	static sanitize(str: string) {
		if (typeof str !== "string") str = (str as any).toString();
		["*", "_", "@"].map(s => str = str.replace(new RegExp(`\\${s}`, "gi"), `\\${s}`));
		return str;
	}

	static consoleSanitize(str: string) {
		if (typeof str !== "string") str = (str as any).toString();
		return str.replace(/\u001B\[[0-9]{1,2}m/g, "");
	}
}
