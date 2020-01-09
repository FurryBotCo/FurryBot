import youtubesearch from "youtube-search";
import ytdl from "ytdl-core";
import * as URL from "url";
import * as os from "os";
import phin from "phin";
import semver from "semver";
import * as fs from "fs-extra";
import * as Eris from "eris";
import util from "util";
import config from "../config";
import { mdb } from "../modules/Database";
import Command from "./CommandHandler/lib/Command";
import loopPatrons from "./patreon/loopPatrons";
import refreshPareonToken from "./patreon/refreshPatreonToken";
import client from "../../";
import testCmd from "commands/developer/test-cmd";

export default {
	checkSemVer: ((ver: string) => semver.valid(ver) === ver),
	secondsToHours: ((sec: number) => {
		let hours: string | number = Math.floor(sec / 3600);
		let minutes: string | number = Math.floor((sec - (hours * 3600)) / 60);
		let seconds: string | number = Math.floor(sec - (hours * 3600) - (minutes * 60));

		if (hours < 10) hours = `0${hours}`;
		if (minutes < 10) minutes = `0${minutes}`;
		if (seconds < 10) seconds = `0${seconds}`;
		return `${hours}:${minutes}:${seconds}`;
	}),
	memory: {
		process: {
			getTotal: ((): number => process.memoryUsage().heapTotal),
			getUsed: ((): number => process.memoryUsage().heapUsed),
			getRSS: ((): number => process.memoryUsage().rss),
			getExternal: ((): number => process.memoryUsage().external),
			getAll: ((): {
				total: number,
				used: number,
				rss: number,
				external: number
			} => ({
				total: process.memoryUsage().heapTotal,
				used: process.memoryUsage().heapUsed,
				rss: process.memoryUsage().rss,
				external: process.memoryUsage().external
			}))
		},
		system: {
			getTotal: ((): number => os.totalmem()),
			getUsed: ((): number => os.totalmem() - os.freemem()),
			getFree: ((): number => os.freemem()),
			getAll: ((): {
				total: number,
				used: number,
				free: number
			} => ({
				total: os.totalmem(),
				used: os.totalmem() - os.freemem(),
				free: os.freemem()
			}))
		}
	},
	ucwords: ((str: string) => str.toString().toLowerCase().replace(/^(.)|\s+(.)/g, (r) => r.toUpperCase())),
	toReadableDate: ((date: Date) => {
		if (!(date instanceof Date)) throw new Error("must provide javascript Date object.");
		const a = date.toISOString().replace("Z", "").split("T");
		return `${a[0]} ${a[1].split(".")[0]} UTC`;
	}),
	ms: (async (data: number | {
		ms?: number;
		s?: number;
		m?: number;
		h?: number;
		d?: number;
		w?: number;
		mn?: number;
		y?: number;
	}, words?: boolean): Promise<string | {
		ms: number;
		s: number;
		m: number;
		h: number;
		d: number;
		w: number;
		mn: number;
		y: number;
	}> => {
		if (typeof data === "number") {
			if (data === 0) {
				if (words) return "0 seconds";
				else return {
					ms: 0,
					s: 0,
					m: 0,
					h: 0,
					d: 0,
					w: 0,
					mn: 0,
					y: 0
				};
			} else if (data < 1000) {
				if (words) return `${data} milliseconds`;
				else return {
					ms: data,
					s: 0,
					m: 0,
					h: 0,
					d: 0,
					w: 0,
					mn: 0,
					y: 0
				};
			}
		} else {
			if (data.ms < 1000 && (Object.keys(data).map(k => data[k]).reduce((a, b) => a + b) - data.ms) === 0) {
				if (words) return `${data.ms} milliseconds`;
				else return {
					ms: data.ms,
					s: 0,
					m: 0,
					h: 0,
					d: 0,
					w: 0,
					mn: 0,
					y: 0
				};
			}
		}
		const t = await new Promise((a, b) => {
			const t = {
				ms: 0,
				s: 0,
				m: 0,
				h: 0,
				d: 0,
				w: 0,
				mn: 0,
				y: 0
			};

			if (typeof data === "number") t.ms = data;
			else if (typeof data !== "object") throw new Error("invalid input");
			else {
				if (data.ms) t.ms = data.ms;
				if (data.s) t.s = data.s;
				if (data.m) t.m = data.m;
				if (data.h) t.h = data.h;
				if (data.d) t.d = data.d;
				if (data.w) t.w = data.w;
				if (data.m) t.mn = data.mn;
				if (data.y) t.y = data.y;
			}

			const shorten = (() => {
				if (t.ms >= 1000) {
					t.ms -= 1000;
					t.s += 1;
				}

				if (t.s >= 60) {
					t.s -= 60;
					t.m += 1;
				}

				if (t.m >= 60) {
					t.m -= 60;
					t.h += 1;
				}

				if (t.h >= 24) {
					t.h -= 24;
					t.d += 1;
				}

				if (t.d >= 30) {
					t.d -= 30;
					t.mn += 1;
				}

				if ((t.mn * 30) + t.d >= 365) {
					t.d = ((t.mn * 30) + t.d) - 365;
					t.mn -= 12;
					t.y += 1;
				}
			});

			const c = () => (t.ms >= 1000) || (t.s >= 60) || (t.m >= 60) || (t.h >= 24) || (t.d >= 30) || (t.w >= 4) || (t.mn >= 12);
			const d = () => t.d >= 7;
			while (c()) {
				shorten();
				if (!c()) {
					if (!d()) return a(t);

					while (d()) {
						t.d -= 7;
						t.w += 1;
						if (!d()) return a(t);
					}
				}
			}
		});

		if (!words) return t as any;
		else {
			const full = {
				ms: "millisecond",
				s: "second",
				m: "minute",
				h: "hour",
				d: "day",
				w: "week",
				mn: "month",
				y: "year"
			};

			const j = {};

			Object.keys(t).forEach((k) => {
				if (t[k] !== 0) j[k] = t[k];
			});

			if (Object.keys(j).length < 1) return {} as any;

			const useFull = Object.keys(j).length < 4;

			return Object.keys(j).reverse().map((k, i, a) => `${i === a.length - 1 && a.length !== 1 ? "and " : ""}${j[k]}${useFull ? ` ${full[k]}${j[k] > 1 ? "s" : ""}` : k}`).join(", ").trim();
		}
	}),
	parseTime: ((time: number, full = false, ms = false) => {
		if (ms) time = time / 1000;
		const methods = [
			{ name: full ? " day" : "d", count: 86400 },
			{ name: full ? " hour" : "h", count: 3600 },
			{ name: full ? " minute" : "m", count: 60 },
			{ name: full ? " second" : "s", count: 1 }
		];

		const timeStr = [`${Math.floor(time / methods[0].count).toString()}${methods[0].name}${Math.floor(time / methods[0].count) > 1 && full ? "s" : ""}`];
		for (let i = 0; i < 3; i++) {
			timeStr.push(`${Math.floor(time % methods[i].count / methods[i + 1].count).toString()}${methods[i + 1].name}${Math.floor(time % methods[i].count / methods[i + 1].count) > 1 && full ? "s" : ""}`);
		}
		let j = timeStr.filter(g => !g.startsWith("0")).join(", ");
		if (j.length === 0) j = "no time";
		return j;
	}),
	randomColor: (() => Math.floor(Math.random() * 0xFFFFFF)),
	removeDuplicates: (<T>(array: T[]) => Array.from(new Set(array))),
	_getDate: ((date = new Date()) => `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`),
	getImageFromURL: (async (url: string) => phin({ url }).then(res => res.body)),
	imageAPIRequest: (async (animal = true, category: string = null, json = true, safe = false): Promise<(
		{
			success: true;
			response: {
				image: string;
				filetype: string;
				name: string;
			};
		} | {
			success: false;
			error: {
				code: number;
				description: string;
			}
		}
	)> => {
		return new Promise(async (resolve, reject) => {
			let s;
			if ([undefined, null].includes(json)) json = true;

			try {
				s = await phin({
					method: "GET",
					url: `https://api.furry.bot/${animal ? "animals" : `furry/${safe ? "sfw" : "nsfw"}`}/${category ? category.toLowerCase() : safe ? "hug" : "bulge"}${json ? "" : "/image"}`.replace(/\s/g, ""),
					parse: "json",
					timeout: 5e3
				});
				resolve(s.body);
			} catch (error) {
				reject({
					error,
					response: s.body
				});
			}
		});
	}),
	random: ((len = 10, keyset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") => {
		let rand = "";
		for (let i = 0; i < len; i++) rand += keyset.charAt(Math.floor(Math.random() * keyset.length));
		return rand;
	}),

	formatStr: (((str: string, ...args: string[]) => {
		let res = str.toString();
		args = args.map(a => a.toString());
		const a = res.match(/({\d})/g);
		const e = ((s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
		const e2 = ((s) => s.replace(/\{/g, "").replace(/\}/g, ""));
		a.map((b) => args[e2(b)] !== undefined ? res = res.replace(new RegExp(e(b), "g"), args[e2(b)]) : null);
		return res;
	})),
	downloadImage: (async (url: string, filename: string): Promise<fs.WriteStream> => phin({ url, timeout: 5e3 }).then(res => res.pipe(fs.createWriteStream(filename)))),
	shortenURL: (async (url: string): Promise<{
		success: boolean;
		code: string;
		url: string;
		link: string;
		linkNumber: number;
		createdTimestamp: number;
		created: string;
		length: number;
		new: boolean;
	}> => {
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
				parse: "json",
				timeout: 5e3
			});

			if (cr.statusCode !== 200) return null;
			else return {
				new: true,
				...cr.body
			};
		}
		else throw new Error(`furry.services api returned non 200/404 response: ${req.statusCode}, body: ${req.body}`);
	}),
	memeRequest: (async (path: string, avatars: string[] | string = [], usernames: string[] | string = [], text = ""): Promise<any> => {
		avatars = typeof avatars === "string" ? [avatars] : avatars;
		usernames = typeof usernames === "string" ? [usernames] : usernames;
		const data: {
			avatars?: string[];
			usernames?: string[];
			text?: string;
		} = {};
		if (avatars && avatars.length > 0) data.avatars = avatars;
		if (usernames && usernames.length > 0) data.usernames = usernames;
		if (text && text.length > 0) data.text = text;
		return phin({
			method: "POST",
			url: `https://dankmemer.services/api${path}`,
			headers: {
				"Authorization": config.apis.dankMemer.token,
				"User-Agent": config.userAgent,
				"Content-Type": "application/json"
			},
			data,
			parse: "none",
			timeout: 3e4
		});
	}),
	compareMembers: ((member1: Eris.Member, member2: Eris.Member): {
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
	} => {
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
	}),
	compareMemberWithRole: ((member: Eris.Member, role: Eris.Role): {
		higher: boolean;
		lower: boolean;
		same: boolean;
	} => {
		const a = member.roles.map(r => member.guild.roles.get(r));
		const b = a.filter(r => r.position === Math.max.apply(Math, a.map(p => p.position)))[0];

		return {
			higher: b.position < role.position,
			lower: b.position > role.position,
			same: b.position === role.position
		};
	}),
	everyOtherUpper: ((str: string) => {
		let res = "";
		for (let i = 0; i < str.length; i++) {
			res += i % 2 === 0 ? str.charAt(i).toUpperCase() : str.charAt(i);
		}
		return res;
	}),
	ytsearch: ((q = "") => util.promisify(youtubesearch)(q, config.ytSearchOptions ? config.ytSearchOptions : {}).then(res => res.filter(y => y.kind === "youtube#video").slice(0, 10))),
	ytinfo: ((url: string): Promise<ytdl.videoInfo> => ytdl.getInfo(url)),
	validateURL: ((url: string) =>
		URL.parse(url).hostname ? phin({
			method: "HEAD",
			url,
			timeout: 5e3
		}).then(d => d.statusCode === 200) : false
	),
	memberIsBooster: (async (m: Eris.Member): Promise<boolean> => {
		if (!(m instanceof Eris.Member)) throw new TypeError("invalid member provided");
		if (!(m instanceof Eris.Member)) throw new TypeError("invalid member provided");
		const guild = await client.getRESTGuild(config.bot.mainGuild);
		if (!guild) throw new TypeError("failed to find main guild");
		if (!guild.members.has(m.user.id) || !guild.members.get(m.user.id).roles.includes(config.nitroBoosterRole)) return false;
		return true;
	}),
	calculateMultiplier: (async (m: Eris.Member): Promise<{ amount: number, multi: { [s: string]: boolean } }> => {
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
	}),
	combineReports: ((...reports: {
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
	} => {
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
	}),
	fetchAuditLogEntries: (async (guild: Eris.Guild, type: number, targetID?: string, fetchAmount = 5): Promise<({
		success: true;
		blame: Eris.User;
		reason: string;
	} | {
		success: false;
		error: {
			text: string;
			code: number;
		};
	})> => {
		if (!guild.members.get(client.user.id).permission.has("viewAuditLogs")) return {
			success: false,
			error: {
				text: "Missing `auditLog` permissions.",
				code: 3
			}
		};
		const logs = await guild.getAuditLogs(fetchAmount, null, type).then(j => j.entries);
		if (logs.length > 0) {
			let et = -1;
			for (const entry of logs) {
				if (entry.actionType === type) {
					if (targetID === null) et = logs.indexOf(entry);
					if (entry.targetID === targetID) et = logs.indexOf(entry);
					break;
				}
				continue;
			}

			if (et !== -1) {
				const entry = logs[et];
				if (logs[et].reason) return {
					success: true,
					blame: entry.user,
					reason: entry.reason
				};
				else return {
					success: true,
					blame: entry.user,
					reason: "Couldn't find a reason."
				};
			} else return {
				success: false,
				error: {
					text: "Failed to fetch audit log entry.",
					code: 1
				}
			};
		} else return {
			success: false,
			error: {
				text: "Failed to fetch audit log entry.",
				code: 2
			}
		};
	}),
	fetchLangMessage: ((lang: string, cmd: Command) => {
		if (!lang || !Object.keys(config.lang).includes(lang.toLowerCase())) throw new TypeError("invalid language provided");
		if (!cmd) throw new TypeError("invalid command provided");

		const l = config.lang[lang.toLowerCase()][cmd.triggers[0].toLowerCase()];
		if (!l) return "";
		return l[Math.floor(Math.random() * l.length)];
	}),
	get loopPatrons() {
		return loopPatrons;
	},
	get refreshPareonToken() {
		return refreshPareonToken;
	},
	incrementDailyCounter: (async (increment = true) => {
		const d = new Date();
		const id = `${d.getMonth()}-${d.getDate()}-${d.getFullYear()}`;

		const j = await mdb.collection("dailyjoins").findOne({ id });
		const count = j ? increment ? j.count + 1 : j.count - 1 : increment ? -1 : 1;
		await mdb.collection("dailyjoins").findOneAndDelete({ id });
		await mdb.collection("dailyjoins").insertOne({ count, id });

		return count;
	}),
	formatDateWithPadding: ((d = new Date(), seconds = true, ms = false) => `${(d.getMonth() + 1).toString().padStart(2, "0")}/${(d.getDate()).toString().padStart(2, "0")}/${d.getFullYear()} ${seconds ? `${(d.getHours()).toString().padStart(2, "0")}:${(d.getMinutes()).toString().padStart(2, "0")}:${(d.getSeconds()).toString().padStart(2, "0")}` : ""}${ms ? `.${(d.getMilliseconds()).toString().padStart(3, "0")}` : ""}`),
	toASCIIEscape: ((str) => {
		const r = [];
		for (let i = 0; i < str.length; i++) r.push(str.charCodeAt(i).toString(16).toUpperCase());
		return {
			escape: r,
			string: `\\u${r.join("\\u")}`
		};
	})
};
