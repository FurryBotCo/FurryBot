import config from "../../config";
import phin from "phin";
import Eris from "eris";
import youtubesearch from "youtube-search";
import ytdl from "ytdl-core";
import * as URL from "url";
import util from "util";
import client from "../../../";

export default class Utility {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * remove duplicates from an array
	 * @static
	 * @template T
	 * @param {T[]} array
	 * @returns
	 * @memberof Utility
	 */
	static removeDuplicates<T>(array: T[]) { return Array.from(new Set(array)); }

	/**
	 *
	 * @static
	 * @param {string} url
	 * @returns {Promise<T.ShortURL>}
	 * @memberof Utility
	 */
	static async shortenURL(url: string): Promise<{
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
	}

	/**
	 * compare 2 members with eachother
	 * @static
	 * @param {Eris.Member} member1
	 * @param {Eris.Member} member2
	 * @returns {{
	 * 		member1: {
	 * 			higher: boolean;
	 * 			lower: boolean;
	 * 			same: boolean;
	 * 		};
	 * 		member2: {
	 * 			higher: boolean;
	 * 			lower: boolean;
	 * 			same: boolean;
	 * 		};
	 * 	}}
	 * @memberof Utility
	 */
	static compareMembers(member1: Eris.Member, member2: Eris.Member): {
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

	/**
	 * compare a member with a role
	 * @static
	 * @param {Eris.Member} member
	 * @param {Eris.Role} role
	 * @returns {{
	 * 		higher: boolean;
	 * 		lower: boolean;
	 * 		same: boolean;
	 * 	}}
	 * @memberof Utility
	 */
	static compareMemberWithRole(member: Eris.Member, role: Eris.Role): {
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

	/**
	 * search videos on youtube
	 * @static
	 * @param {string} [q=""]
	 * @returns {Promise<youtubesearch.YouTubeSearchResults[]>}
	 * @memberof Utility
	 */
	static ytsearch(q = "") { return util.promisify(youtubesearch)(q, config.ytSearchOptions ? config.ytSearchOptions : {}).then(res => res.filter(y => y.kind === "youtube#video").slice(0, 10)); }

	/**
	 * Get info on a youtube video
	 * @param {string} url
	 * @returns {Promise<ytdl.videoInfo>}
	 * @memberof Utility
	 */
	static ytinfo(url: string): Promise<ytdl.videoInfo> { return ytdl.getInfo(url); }

	/**
	 * validate a url
	 * @param {string} url
	 * @returns
	 * @memberof Utility
	 */
	static validateURL(url: string) {
		return URL.parse(url).hostname ? phin({
			method: "HEAD",
			url,
			timeout: 5e3
		}).then(d => d.statusCode === 200) : false;
	}

	/**
	 * Fetch audit logs from a guild
	 * @static
	 * @param {Eris.Guild} guild
	 * @param {number} type
	 * @param {string} [targetID]
	 * @param {number} [fetchAmount=5]
	 * @returns {(Promise<({
	 * 		success: true;
	 * 		blame: Eris.User;
	 * 		reason: string;
	 * 	} | {
	 * 		success: false;
	 * 		error: {
	 * 			text: string;
	 * 			code: number;
	 * 		};
	 * 	})>)}
	 * @memberof Utility
	 */
	static async fetchAuditLogEntries(guild: Eris.Guild, type: number, targetID?: string, fetchAmount = 5): Promise<({
		success: true;
		blame: Eris.User;
		reason: string;
	} | {
		success: false;
		error: {
			text: string;
			code: number;
		};
	})> {
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
	}

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
}
