import * as fs from "fs-extra";
import dot from "dot-object";
import JSON5 from "json5";
import Strings from "./Functions/Strings";

/*
FORMAT (parsing):
Normal - {lang:some.language.location}
Formatting - {lang:some.language.location|arg} (use {0} and up for arg locations)
Modifiers - {lang:some.language.location$ucwords$}
Both formatting and modifiers can be combined. Order does not matter, prefer formatting then modifiers.
*/

// because circular dependencies
const dir = `${__dirname}/..${__filename.endsWith(".ts") ? "" : "/../../src"}/config/lang`;
class LanguageError extends Error {
	constructor(name: string, message: string) {
		super(message);
		if (!name.toLowerCase().endsWith("error")) name += "Error";
		this.name = name;
	}
}

export type Languages = typeof Language["LANGUAGES"][number];
export default class Language {
	// this shouldn't really be hardcoded but typings
	static LANGUAGES = [
		"en"
	] as const;
	static MODIFIERS = {
		ucwords: (str: string) => Strings.ucwords(str),
		upper: (str: string) => str.toUpperCase(),
		lower: (str: string) => str.toLowerCase(),
		italic: (str: string) => `*${str}*`,
		bold: (str: string) => `**${str}**`
	};
	private constructor() { }

	static get(lang: Languages, path: string, formatArgs: (string | number)[], nullOnNotFound: boolean, random: false): string[];
	static get(lang: Languages, path: string, formatArgs?: (string | number)[], nullOnNotFound?: boolean, random?: true): string;
	static get(lang: Languages, path: string, formatArgs?: (string | number)[], nullOnNotFound?: boolean, random?: boolean): string | string[] {
		function loop(dir: string, parts: string[]): string | string[] {
			if (fs.existsSync(`${dir}/${parts[0]}.json`)) {
				const f = JSON5.parse(fs.readFileSync(`${dir}/${parts[0]}.json`).toString());
				const v = dot.pick(parts.slice(1).join("."), f);
				if (v) return v;
			}

			if (!fs.existsSync(`${dir}/${parts[0]}`)) {
				if (!fs.existsSync(`${dir}/${parts[0]}.json`)) return null;
				const f = JSON5.parse(fs.readFileSync(`${dir}/${parts[0]}.json`).toString());
				return dot.pick(parts.slice(1).join("."), f) ?? null;
			}
			else return loop(`${dir}/${parts[0]}`, parts.slice(1));
		}

		let str = loop(`${dir}/${lang}`, path.split("."));
		if ([undefined, null].includes(str)) return nullOnNotFound ? null : `{lang:${path}}`;

		if (str instanceof Array) {
			if ([null, undefined].includes(random) || random) {
				str = str[Math.floor(Math.random() * str.length)];
				if (formatArgs) str = Strings.formatString(str, formatArgs);
			} else {
				if (formatArgs) str.map((s, i) => (str[i] as any) = Strings.formatString(s, formatArgs));
			}

			return str;
		} else {
			if (formatArgs) str = Strings.formatString(str, formatArgs);
			return str;
		}
	}

	static has(lang: string) { return fs.existsSync(`${dir}/${lang}.json`); }

	static parseString(lang: Languages, str: string): string {
		if (!str) return "";
		const a = str.match(/{lang:(.*?)}/);
		if (!a) return str;
		const b = a[0];
		let c = a[1];
		const mods: ((str: string) => string)[] = [];
		(c.match(/\$(.*?)\$/g) || []).map(mod => {
			mod = mod.replace(/\$/g, "");
			c = c.replace(`$${mod}$`, "");
			const j = this.MODIFIERS[mod];
			if (!j) {
				const e = new LanguageError("UnknownModifierError", `Unknown modifier "${mod}"`).stack;
				// would be Logger but circular dependencies suck
				console.warn("Language", e);
			} else mods.push(j);
		});
		const d = c.split("|");
		let l = this.get(lang, d[0], d.slice(1), true);
		if ([undefined, null].includes(l)) {
			l = b.replace(":", "\u200b:").split("|")[0].split("$")[0];
			if (!l.replace("\u200b", "").startsWith("{lang:")) l = `{lang:\u200b${l}`;
			if (!l.endsWith("}")) l += "}";
		} else mods.map(mod => l = mod(l));
		str = str.replace(b, l);
		return this.parseString(lang, str);
	}
}
