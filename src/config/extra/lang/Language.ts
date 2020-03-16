import YAML from "yaml";
import * as fs from "fs-extra";
import _ from "lodash";

interface LangString extends String {
	format<T extends any = string>(...args: T[]): string;
}

// dear god this took so long
(String as any).prototype.format = (function <T extends string = string>(...args: T[]) {
	let res = this.toString();
	const a = res.match(/({\d})/g);
	const e = ((s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
	a.map((b, i) => args[i] !== undefined ? res = res.replace(new RegExp(e(b), "g"), args[i]) : null);
	return res;
});

class Language {
	lang: string;
	private entries: { [k: string]: object; };
	constructor(lang: string, entries: { [k: string]: object; }) {
		this.lang = lang;
		this.entries = entries;
	}

	// get(str: string) { return typeof this.entries[str] === "undefined" ? null : this.entries[str]; }
	get(str: string) {
		let s = _.get(this.entries, str) as unknown as LangString;
		if (!s) return null;
		if (s instanceof Array) s = s[Math.floor(Math.random() * s.length)];

		return s;
	}
}

export default class LanguageHolder {
	private constructor() { }

	static get(lang: string) {
		if (!fs.existsSync(`${__dirname}/${lang}.yaml`)) throw new TypeError("invalid language");
		const l = YAML.parse(fs.readFileSync(`${__dirname}/${lang}.yaml`).toString());
		return new Language(lang, l);
	}

	static has(lang: string) { return fs.existsSync(`${__dirname}/${lang}.lang`); }
}
