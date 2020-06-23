import config from "../../config";
import Eris, { Guild } from "eris";
import { Utility as T } from "../@types/Functions";
import FurryBot from "../../main";
import * as URL from "url";
import phin from "phin";
import { BaseClusterWorker } from "eris-fleet";

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
	 * compare 2 members with eachother
	 * @static
	 * @param {Eris.Member} member1
	 * @param {Eris.Member} member2
	 * @returns {T.CompareMembersResult}
	 * @memberof Utility
	 */
	static compareMembers(member1: Eris.Member, member2: Eris.Member): T.CompareMembersResult {
		// some things that we can immediately return so we don't process them
		if (member1.id === member2.id) return {
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
		else if (member1.id === member1.guild.ownerID) return {
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
		else if (member2.id === member1.guild.ownerID) return {
			member1: {
				higher: false,
				lower: false,
				same: false
			},
			member2: {
				higher: true,
				lower: false,
				same: false
			}
		};

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
	 * @returns {T.CompareMemberWithRoleResult}
	 * @memberof Utility
	 */
	static compareMemberWithRole(member: Eris.Member, role: Eris.Role): T.CompareMemberWithRoleResult {
		if (member.id === member.guild.ownerID) return { higher: false, lower: true, same: false };
		const a = member.roles.map(r => member.guild.roles.get(r)).map(r => r.position).sort((a, b) => b - a)[0];

		return {
			higher: a > role.position,
			lower: a < role.position,
			same: a === role.position
		};
	}

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
	 * @returns {(Promise<T.AuditLogReturn>}
	 * @memberof Utility
	 */
	static async fetchAuditLogEntries(client: BaseClusterWorker, guild: Eris.Guild, type: number, targetID?: string, fetchAmount = 5): Promise<T.AuditLogReturn> {
		if (!guild.members.get(client.bot.user.id).permission.has("viewAuditLogs")) return {
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
