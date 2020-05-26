import YAML from "yaml";
import * as fs from "fs-extra";
import config from "../config";
interface LangString extends String {
	format<T extends any = string>(...args: T[]): string;
}

// required because ts is being dumb
(String as any).prototype.format = (function <T extends string = string>(...args: T[]) {
	let res = this.toString();
	if (!res) return null;
	const a = res.match(/({\d})/g);
	if (!a) return null;
	const e = ((s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
	a.map((b, i) => args[i] !== undefined ? res = res.replace(new RegExp(e(b), "g"), args[i]) : null);
	return res;
});

class SpecificLanguage {
	lang: string;
	private entries: { [k: string]: object; };
	constructor(lang: string, entries: { [k: string]: object; }) {
		this.lang = lang;
		this.entries = entries;
	}

	get(str: string) {

		/**
		 * Gets nested properties from objects
		 * @param {*} obj - the object to get stuff from
		 * @param {string} prop - the property to look for (dot notation for nested)
		 * @returns {string}
		 */
		function get(obj: any, prop: string): string {
			if (!obj) return null;
			const p = prop.split(".");
			if (typeof obj[p[0]] !== "undefined") return p.length > 1 ? get(obj[p[0]], p.slice(1).join(".")) : obj[p[0]];
			else return null;
		}
		let s = get(this.entries, str) as unknown as LangString;
		if ([undefined, null].includes(s)) return null;
		if (s instanceof Array) s = s[Math.floor(Math.random() * s.length)];

		return s;
	}

	parseString(str: string): string {
		if (!str) return "";
		const r = new RegExp("{lang:(.*?)}"); // make match non-greedy with ?
		const m = str.match(r);
		if (!m || m.length === 0) return str;
		else {
			const k = m[1].split("|");
			let l = this.get(k[0]);
			if ([undefined, null].includes(l)) l = m[0].replace(":", "\u200b:") as any; // insert ZWSP on no match to avoid looping
			else if (k.length > 1) l = l.format(...k.slice(1)) as any;
			str = str.replace(m[0], l as any);
			return this.parseString(str);
		}
	}
}

export default class Language {
	private constructor() { }

	static get(lang: string): SpecificLanguage;
	static get(lang: string, path: string, parseable?: true): LangString;
	static get(lang: string, path: string, parseable: false): string;
	static get(lang: string, path?: string, parseable?: boolean) {
		if (!fs.existsSync(`${config.dir.lang}/${lang}.yaml`)) lang = "en"; // (prefer default over error) throw new TypeError("invalid language");
		const l = YAML.parse(fs.readFileSync(`${config.dir.lang}/${lang}.yaml`).toString());
		const ln = new SpecificLanguage(lang, l);
		if (!path) return ln;
		else {
			const s = ln.get(path);
			return !parseable ? s.toString() : s;
		}
	}

	static has(lang: string) { return fs.existsSync(`${config.dir.lang}/${lang}.yaml`); }

	static parseString(lang: string, str: string) {
		if (!this.has(lang)) throw new TypeError("Invalid language.");
		else return this.get(lang).parseString(str);
	}
}
