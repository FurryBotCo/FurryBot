import * as fs from "fs-extra";
import config from "../config";
import dot from "dot-object";
import MakeFile from "../config/extra/lang/MakeFile";
interface LangString extends String {
	format<T extends any = string>(...args: T[]): string;
}

// required because ts is being dumb
(String as any).prototype.format = (function <T extends string = string>(...args: T[]) {
	let res: string = this.toString();
	if (!res) return null;
	args.map((a, i) => res = res.replace(new RegExp(`\\{${i}\\}`, "g"), a));
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
		let s = dot.pick(str, this.entries) as unknown as LangString;
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

	static genJSON(lang: string) {
		if (!fs.existsSync(`${config.dir.lang}/${lang}`)) throw new TypeError(`Invalid language "${lang}".`);
		MakeFile(lang);
	}

	static get(lang: string): SpecificLanguage;
	static get(lang: string, path: string, parseable?: true): LangString;
	static get(lang: string, path: string, parseable: false): string;
	static get(lang: string, path?: string, parseable?: boolean) {
		if (!fs.existsSync(`${config.dir.lang}/${lang}`)) lang = "en"; // (prefer default over error) throw new TypeError("invalid language");
		if (!fs.existsSync(`${config.dir.lang}/${lang}.json`)) this.genJSON(lang);
		const l = JSON.parse(fs.readFileSync(`${config.dir.lang}/${lang}.json`).toString());
		const ln = new SpecificLanguage(lang, l);
		if (!path) return ln;
		else {
			const s = ln.get(path);
			if (!s) return `{lang:${path}}`;
			return !parseable ? s.toString() : s;
		}
	}

	static has(lang: string) { return fs.existsSync(`${config.dir.lang}/${lang}.json`); }

	static parseString(lang: string, str: string) {
		if (!this.has(lang)) throw new TypeError("Invalid language.");
		else return this.get(lang).parseString(str);
	}
}
