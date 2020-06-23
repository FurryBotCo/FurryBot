import Eris from "eris";
import Command from "./Command";
import { CategoryRestrictions } from "../../util/@types/cmd";
import FurryBot from "../../main";
import ExtendedMessage from "../ExtendedMessage";

class TriggerDuplicationError extends TypeError {
	command: string;
	category: string;
	file: string;
	constructor(command: string, category: string, file: string) {
		super(`Duplicate command trigger "${command}" (category: ${category}, file: ${file})`);

		this.name = "TriggerDuplicationError";
		this.command = command;
		this.category = category;
		this.file = file;
	}
}

export default class Category {
	private cmds: Command[];
	name: string;
	restrictions: CategoryRestrictions[];
	displayName: string;
	description: string;
	file: string;
	constructor(d: {
		name: string;
		restrictions: CategoryRestrictions[];
		displayName?: string; // provided here or in lang
		description?: string; // provided here or in lang
		file: string;
	}) {
		this.cmds = [];
		this.name = d.name;
		this.restrictions = d.restrictions || [];
		this.displayName = d.displayName || `{lang:categories.${d.name}.displayName}`;
		this.description = d.description || `{lang:categories.${d.name}.description}`;
		this.file = d.file;
	}

	get commands() { return [...this.cmds]; }
	get triggers() { return this.cmds.reduce((a, b) => a.concat(b.triggers), []); }

	reloadCommands() {
		return Promise.all(this.commands.map(async (cmd) => this.reloadCommand(cmd.triggers[0])));
	}

	addCommand(cmd: Command) {
		// I could do a some, but this makes it easy to tell which trigger was duplicated
		for (const t of cmd.triggers) {
			if (this.triggers.includes(t)) throw new TriggerDuplicationError(t, this.name, cmd.file);
		}

		this.cmds.push(cmd);
		return this;
	}

	removeCommand(cmd: string | Command) {
		if (cmd instanceof Command) cmd = cmd.triggers[0];
		const c = this.commands.find(c => c.triggers.includes(cmd as string));
		if (!c) return false;
		this.cmds.splice(this.cmds.indexOf(c));
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
