import Category from "./Category";
import Command from "./Command";
import Logger from "../Logger";
import * as Restrictions from "./restrictions";
import ExtraHandlers from "./ExtraHandlers";
import CooldownHandler from "./CooldownHandler";
import AntiSpam from "./AntiSpam";
import FurryBot from "../../main";
import path from "path";
import Strings from "../Functions/Strings";


export class ReloadError<T extends ("command" | "category")> extends Error {
	type: T;
	info: T extends "command" ? Command : Category;
	constructor(message: string, type: T, info: ReloadError<T>["info"]) {
		super(message);
		this.name = `ReloadError[${Strings.ucwords(type)}]`;
		this.type = type;
		this.info = info;
	}

	get file() {
		return this.info.file;
	}
	get tsFile() {
		return this.info.tsFile;
	}
}

export default class CommandHandler {
	#cats: Category[];
	#client: FurryBot;
	#extra: ExtraHandlers;
	#cool: CooldownHandler;
	#anti: AntiSpam;
	constructor(client: FurryBot) {
		this.#cats = [];
		this.#client = client;
		this.#extra = new ExtraHandlers();
		this.#cool = new CooldownHandler();
		this.#anti = new AntiSpam(client);
	}

	get handlers() {
		return this.#extra;
	}
	get cool() {
		return this.#cool;
	}
	get anti() {
		return this.#anti;
	}
	get restrictions() {
		return Restrictions;
	}
	get categories() {
		return [...this.#cats];
	}
	get commands(): Command[] {
		return [...this.#cats.reduce((a, b) => a.concat(b.commands), [])];
	}
	get triggers(): string[] {
		return [...this.#cats.reduce((a, b) => a.concat(b.commands.reduce((c, d) => c.concat(d.triggers), [])), [])];
	}
	get categoryNames() {
		return this.#cats.map(c => c.name);
	}

	getCategory(data: string) {
		if (!data) throw new TypeError("Missing category.");
		return this.#cats.find(c => c.name === data) || null;
	}

	addCategory(data: Category) {
		if (!data) throw new TypeError("Missing category.");
		if (this.categoryNames.includes(data.name)) throw new TypeError(`Duplicate category "${data.name}" in file "${data.file}" (duplicate: ${this.#cats.find(c => c.name === data.name).file})`);
		for (const cmd of data.commands) {
			for (const cmd2 of this.commands) {
				if (cmd2.triggers.some(t => cmd.triggers.includes(t))) throw new TypeError(`Duplicate command "${cmd.triggers[0]}" (file: ${cmd.file}), duplicate file: ${cmd2.file}`);
			}
		}
		Logger.debug([`Cluster #${this.#client.cluster.id}`, "Command Handler"], `Added the category ${data.name} with ${data.commands.length} command${data.commands.length === 1 ? "" : "s"}.`);
		this.#cats.push(data);
		return true;
	}

	removeCategory(data: Category | string) {
		if (!data) throw new TypeError("Missing category.");
		if (typeof data === "string") data = this.#cats.find(c => c.name === data);
		if (!data || !this.#cats.includes(data)) return false;
		Logger.debug([`Cluster #${this.#client.cluster.id}`, "Command Handler"], `Remove the category ${data.name}.`);
		this.#cats.splice(this.#cats.indexOf(data), 1);
		return true;
	}

	getCommand(data: Command | string) {
		if (!data) throw new TypeError("Missing command.");
		const cmd = this.commands.find(c => c.triggers.some(t => data instanceof Command ? data.triggers.includes(t) : data === t));

		if (!cmd) return {
			cmd: null,
			cat: null
		};

		return {
			cmd,
			cat: cmd.category
		};
	}

	reloadCategory(cat: string | Category) {
		if (typeof cat !== "string") cat = cat.name;

		const c = this.getCategory(cat);
		if (!c) return false;

		this.removeCategory(c.name);

		let i = 0;

		Object.keys(require.cache)
			.filter(k => k.startsWith(c.file.split(path.sep.replace(/\\/, "\\\\")).slice(0, -1).join(path.sep.replace(/\\/, "\\\\")))) // because windows
			.map(f => (i++, delete require.cache[require.resolve(f)]));

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const f = require(c.file).default;

		this.addCategory(f);

		return true;
	}
}
