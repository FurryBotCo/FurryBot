/// <reference path="../@types/global.d.ts" />
import Command from "./Command";

export default class Category {
	name: string;
	displayName: string;
	description: string;
	restrictions: CategoryRestrictions[];
	file: string;
	#cmds: Command[];
	constructor(name: string, file: string) {
		this.name = name;
		this.displayName = "";
		this.file = file;
		this.#cmds = []; this.description = "";
		this.restrictions = [];

	}

	get commands() { return [...this.#cmds]; }
	get triggers() { return this.#cmds.reduce((a, b) => a.concat(b.triggers), [] as string[]); }

	setDisplayName(data: Category["displayName"]) {
		this.displayName = data;
		return this;
	}

	setRestrictions(data: Category["restrictions"]) {
		this.restrictions = data ?? [];
		return this;
	}

	setDescription(data: Category["description"]) {
		this.description = data;
		return this;
	}

	addCommand(data: Command) {
		if (!data) throw new TypeError("Missing command.");
		// I could do this differently but nah
		for (const t of data.triggers) if (this.triggers.includes(t)) throw new TypeError(`Duplicate trigger "${t}" in command "${data.file}" (duplicate: ${this.#cmds.find(c => c.triggers.includes(t)).file})`);
		data.setCategory(this);
		this.#cmds.push(data);
		return true;
	}

	removeCommand(data: Command | string) {
		if (typeof data === "string") data = this.#cmds.find(c => c.triggers.includes(data as string));
		if (!data || !this.#cmds.includes(data)) return false;
		this.#cmds.splice(this.#cmds.indexOf(data), 1);
		return true;
	}

	async reloadCommand(cmd: string | Command) {
		if (cmd instanceof Command) cmd = cmd.triggers[0];
		const c = this.commands.find(c => c.triggers.includes(cmd as string));
		if (!c) return null;
		delete require.cache[require.resolve(c.file)];
		const f = await import(c.file).then(d => d.default) as Command;
		this.removeCommand(cmd);
		this.addCommand(f);
		return true;
	}
}