import * as os from "os";
import phin from "phin";
import config from "../config";
import * as util from "util";
import * as fs from "fs-extra";
import * as Eris from "eris";
import FurryBot from "@FurryBot";
import { mdb } from "../modules/Database";
import { ErrorHandler, Functions, ExtendedMessage, ExtendedTextChannel, ExtendedUser } from "bot-stuff";
import { Command } from "command-handler";
import { Logger } from "clustersv2";
import UserConfig from "../modules/config/UserConfig";
import GuildConfig from "../modules/config/GuildConfig";
import youtubesearch from "youtube-search";
import ytdl from "ytdl-core";
import * as URL from "url";
import refreshPatreonToken from "./patreon/refreshPatreonToken";
import loopPatrons from "./patreon/loopPatrons";

export { ErrorHandler };

export default class F extends Functions<FurryBot, ExtendedMessage<FurryBot, UserConfig, GuildConfig>> {
	client: FurryBot;
	constructor(client: FurryBot) {
		super(client, config);
		this.client = client;
	}

	async sendCommandEmbed(msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>, cmd: Command<ExtendedMessage<FurryBot, UserConfig, GuildConfig>, FurryBot>): Promise<Eris.Message> {
		if (!msg || !(msg instanceof ExtendedMessage)) throw new TypeError("invalid message");
		if (!cmd) throw new TypeError("missing command");

		let embed;
		if (cmd.subCommands.length > 0) {
			embed = {
				title: `Subcommand List: ${this.ucwords(cmd.triggers[0])}`,
				description: `\`command\` (\`alias\`) - description\n\n${cmd.subCommands.map(s => s.triggers.length > 1 ? `\`${s.triggers[0]}\` (\`${s.triggers[1]}\`) - ${s.description}` : `\`${s.triggers[0]}\` - ${s.description}`).join("\n")}`
			};
		} else {
			embed = {
				title: `Command Help: ${this.ucwords(cmd.triggers[0])}`,
				description: `Usage: ${cmd.usage}\nDescription: ${cmd.description}`
			};
		}
		return msg.channel.createMessage({
			embed
		});
	}

	_getDate(date = new Date()) {
		return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
	}

	async getImageFromURL(url: string): Promise<Buffer> {
		return phin({ url }).then(res => res.body);
	}

	async imageAPIRequest(animal = true, category: string = null, json = true, safe = false): Promise<{
		success: boolean;
		response?: {
			image: string;
			filetype: string;
			name: string;
		};
		error?: "invalid category" | {
			code: number;
			description: string;
		}
	}> {
		return new Promise(async (resolve, reject) => {
			let s;
			if ([undefined, null].includes(json)) json = true;

			try {
				s = await phin({
					method: "GET",
					url: `https://api.furry.bot/${animal ? "animals" : `furry/${safe ? "sfw" : "nsfw"}`}/${category ? category.toLowerCase() : safe ? "hug" : "bulge"}${json ? "" : "/image"}`.replace(/\s/g, ""),
					parse: "json"
				});
				resolve(s.body);
			} catch (error) {
				reject({
					error,
					response: s.body
				});
			}
		});
	}

	random(len = 10, keyset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string {
		let rand = "";
		for (let i = 0; i < len; i++) rand += keyset.charAt(Math.floor(Math.random() * keyset.length));
		return rand;
	}

	formatStr(str: string | ExtendedUser | Eris.User | Eris.Member | ExtendedTextChannel | Eris.GuildChannel, ...args: any[]): string {
		let res;
		if (str instanceof ExtendedUser || str instanceof Eris.User || str instanceof Eris.Member) res = `<@!${str.id}>`;
		else if (str instanceof ExtendedTextChannel || str instanceof Eris.GuildChannel) res = str.name;
		else res = str.toString();
		args = args.map(a => a.toString());
		const a = res.match(/({\d})/g);
		const e = ((s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
		const e2 = ((s) => s.replace(/\{/g, "").replace(/\}/g, ""));
		a.map((b) => args[e2(b)] !== undefined ? res = res.replace(new RegExp(e(b), "g"), args[e2(b)]) : null);
		return res;
	}

	async downloadImage(url: string, filename: string): Promise<fs.WriteStream> {
		return phin({ url }).then(res => res.pipe(fs.createWriteStream(filename)));
	}

	async shortenURL(url: string): Promise<{
		success: boolean;
		code: string;
		url: string;
		link: string;
		linkNumber: number;
		createdTimestamp: number;
		created: string;
		length: number;
		new: boolean;
	}> {
		const req = await phin({
			url: `https://r.furry.services/get?url=${encodeURIComponent(url)}`,
			headers: {
				"User-Agent": config.web.userAgent
			},
			parse: "json"
		});

		if (req.statusCode === 200) return {
			new: false,
			...req.body
		};
		else if (req.statusCode === 404) {
			const cr = await phin({
				method: "POST",
				url: `https://r.furry.services/create?url=${encodeURIComponent(url)}`,
				headers: {
					"User-Agent": config.web.userAgent
				},
				parse: "json"
			});

			if (cr.statusCode !== 200) return null;
			else return {
				new: true,
				...cr.body
			};
		}
		else throw new Error(`furry.services api returned non 200/404 response: ${req.statusCode}, body: ${req.body}`);
	}

	async memeRequest(path: string, avatars: string[] | string = [], text = ""): Promise<phin.JsonResponse> {
		avatars = typeof avatars === "string" ? [avatars] : avatars;
		return phin({
			method: "POST",
			url: `https://dankmemer.services/api${path}`,
			headers: {
				"Authorization": config.apis.dankMemer.token,
				"User-Agent": config.userAgent,
				"Content-Type": "application/json"
			},
			data: {
				avatars,
				text
			},
			parse: "none"
		});
	}

	compareMembers(member1: Eris.Member, member2: Eris.Member): {
		member1: {
			higher: boolean;
			lower: boolean;
			same: boolean;
		};
		member2: {
			higher: boolean;
			lower: boolean;
			same: boolean;
		};
	} {
		const a = member1.roles.map(r => member1.guild.roles.get(r));
		let b: Eris.Role;
		if (a.length > 0) b = a.filter(r => r.position === Math.max.apply(Math, a.map(p => p.position)))[0];

		const c = member2.roles.map(r => member2.guild.roles.get(r));
		let d: Eris.Role;
		if (c.length > 0) d = c.filter(r => r.position === Math.max.apply(Math, c.map(p => p.position)))[0];

		if (!b && d) return {
			member1: {
				higher: false,
				lower: true,
				same: false
			},
			member2: {
				higher: true,
				lower: false,
				same: false
			}
		};

		if (b && !d) return {
			member1: {
				higher: true,
				lower: false,
				same: false
			},
			member2: {
				higher: false,
				lower: true,
				same: false
			}
		};

		if (!b && !d) return {
			member1: {
				higher: false,
				lower: false,
				same: true
			},
			member2: {
				higher: false,
				lower: false,
				same: true
			}
		};
		return {
			member1: {
				higher: b.position > d.position,
				lower: b.position < d.position,
				same: b.position === d.position
			},
			member2: {
				higher: d.position > b.position,
				lower: d.position < b.position,
				same: d.position === b.position
			}
		};
	}

	compareMemberWithRole(member: Eris.Member, role: Eris.Role): {
		higher: boolean;
		lower: boolean;
		same: boolean;
	} {
		const a = member.roles.map(r => member.guild.roles.get(r));
		const b = a.filter(r => r.position === Math.max.apply(Math, a.map(p => p.position)))[0];

		return {
			higher: b.position < role.position,
			lower: b.position > role.position,
			same: b.position === role.position
		};
	}

	everyOtherUpper(str: string): string {
		let res = "";
		for (let i = 0; i < str.length; i++) {
			res += i % 2 === 0 ? str.charAt(i).toUpperCase() : str.charAt(i);
		}
		return res;
	}

	async incrementDailyCounter(positive = true, guildCount: number) {
		const d = new Date(),
			date = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;

		const a = await mdb.collection("dailyjoins").findOne({ date });
		let count;
		if (!a) {
			count = 0;
			await mdb.collection("dailyjoins").insertOne({ date, count, guildCount });
		}
		else count = a.count;

		count = parseInt(count, 10);

		if (isNaN(count)) count = 0;

		if (positive) count++; else count--;

		return mdb.collection("dailyjoins").findOneAndUpdate({ date }, { $set: { count, guildCount } });
	}

	async memberIsBooster(m: Eris.Member): Promise<boolean> {
		if (!(m instanceof Eris.Member)) throw new TypeError("invalid member provided");
		if (!(m instanceof Eris.Member)) throw new TypeError("invalid member provided");
		const guild = await this.client.bot.getRESTGuild(config.bot.mainGuild);
		if (!guild) throw new TypeError("failed to find main guild");
		if (!guild.members.has(m.user.id) || !guild.members.get(m.user.id).roles.includes(config.nitroBoosterRole)) return false;
		return true;
	}

	async calculateMultiplier(m: Eris.Member): Promise<{ amount: number, multi: { [s: string]: boolean } }> {
		if (!(m instanceof Eris.Member)) throw new TypeError("invalid member provided");
		const member = m;
		const guild = m.guild;

		const a = [];
		let amount = 0;
		const multi = {
			supportServer: false,
			voteWeekend: false,
			vote: false,
			booster: false,
			tips: false
		};

		if (guild.id === config.bot.mainGuild) {
			multi.supportServer = true;
			a.push(config.eco.multipliers.supportServer);
		}

		const v = await mdb.collection("votes").find({ userId: member.user.id }).toArray().then(res => res.filter(r => (r.timestamp + config.eco.voteTimeout) > Date.now()));
		if (v.length !== 0) {
			if (v[0].isWeekend) { // vote weekend multiplier
				a.push(config.eco.multipliers.voteWeekend);
				a.push(config.eco.multipliers.vote);
				multi.vote = true;
				multi.voteWeekend = true;
			}
			else { // vote weekday multiplier
				a.push(config.eco.multipliers.vote);
				multi.vote = true;
			}
		}


		const b = await this.memberIsBooster(member);
		if (b) (a.push(config.eco.multipliers.booster), multi.booster = true);

		const t = await mdb.collection("users").findOne({ id: m.user.id }).then(res => res.tips).catch(err => false);
		if (t) {
			a.push(config.eco.multipliers.tips);
			multi.tips = true;
		}
		amount = parseFloat(a.filter(n => !isNaN(n)).reduce((a, b) => a + b).toFixed(3));

		do {
			if (amount.toString().endsWith("0")) amount = parseFloat(amount.toString().slice(0, amount.toString().length - 1));
		}
		while (amount.toString().endsWith("0"));


		return { multi, amount };
	}

	async fetchDBUser(id: string, createIfNotFound = false): Promise<UserConfig> {
		let m = await mdb.collection("users").findOne({ id });
		if (!m) {
			if (createIfNotFound === true) {
				Logger.log(`Cluster #${this.client.clusterId}`, `Created non existent user entry "${id}"`);
				await mdb.collection("users").insertOne({ id, ...config.defaults.userConfig });
				m = await mdb.collection("users").findOne({ id });
			} else return null;
		}
		return new UserConfig(id, m);
	}

	async fetchDBGuild(id: string, createIfNotFound = false): Promise<GuildConfig> {
		let g = await mdb.collection("guilds").findOne({ id });
		if (!g) {
			if (createIfNotFound === true) {
				Logger.log(`Cluster #${this.client.clusterId}`, `Created non existent guild entry "${id}"`);
				await mdb.collection("guilds").insertOne({ id, ...config.defaults.guildConfig });
				g = await mdb.collection("guilds").findOne({ id });
			} else return null;
		}
		return new GuildConfig(id, g);
	}

	async ytsearch(q = "") {
		return util.promisify(youtubesearch)(q, config.ytSearchOptions).then(res => res.filter(y => y.kind === "youtube#video").slice(0, 10));
	}

	async ytinfo(url: string): Promise<ytdl.videoInfo> {
		return util.promisify(ytdl.getInfo)(url) as any;
	}

	async validateURL(url: string): Promise<boolean> {
		return URL.parse(url).hostname ? phin({
			method: "HEAD",
			url
		}).then(d => d.statusCode === 200) : false;
	}

	combineReports(...reports: {
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

	get refreshPatreonToken() {
		return refreshPatreonToken;
	}

	get loopPatrons() {
		return loopPatrons;
	}

	fetchLangMessage(lang: string, cmd: Command<ExtendedMessage<FurryBot, UserConfig, GuildConfig>, FurryBot>) {
		if (!lang || !Object.keys(config.lang).includes(lang.toLowerCase())) throw new TypeError("invalid language provided");
		if (!cmd) throw new TypeError("invalid command provided");

		const l = config.lang[lang.toLowerCase()][cmd.triggers[0].toLowerCase()];
		if (!l) return "";
		return l[Math.floor(Math.random() * l.length)];
	}
}
