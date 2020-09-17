import deasync from "deasync";
import config from "../../config";
import { Languages } from "../Language";
import EmbedBuilder from "../EmbedBuilder";
import Eris from "eris";
import y from "yargs";
import { Colors } from "../Constants";

export default class Utility {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * get the output of an async function synchronously
	 * @param {Promise<T>} func - the function to get the result of synchronously
	 * @template T
	 */
	static sync<T>(func: Promise<T>) {
		async function go(f: typeof func, cb: (err?: Error, res?: any) => void) {
			return f.then(res => cb(null, res)).catch(err => cb(err, null));
		}

		return deasync(go)(func);
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

	static getLongestString(arr: (string | number)[]) {
		let longest = 0;
		for (const v of arr) if (v.toString().length > longest) longest = v.toString().length;
		return longest;
	}

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

	static compareMembers(member1: Eris.Member, member2: Eris.Member) {
		const g = member1.guild;
		const m1r = member1.roles.map(r => g.roles.get(r).position).sort((a, b) => b - a)[0];
		const m2r = member2.roles.map(r => g.roles.get(r).position).sort((a, b) => b - a)[0];
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

	static compareMemberWithRole(member: Eris.Member, role: Eris.Role) {
		const g = member.guild;
		const mr = member.roles.map(r => g.roles.get(r).position).sort((a, b) => b - a)[0];

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

	static getTopRole(member: Eris.Member, filter?: (role: Eris.Role) => boolean) {
		if (!filter) filter = () => true;
		return member.roles.map(r => member.guild.roles.get(r)).filter(filter).sort((a, b) => b.position - a.position)[0];
	}

	static getColorRole(member: Eris.Member) {
		return this.getTopRole(member, (role) => role.color !== 0);
	}
}
