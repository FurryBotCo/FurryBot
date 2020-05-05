import Command from "./Command";
import { Logger } from "../../../util/LoggerV8";

export default class Category {
	name: string;
	displayName: string;
	devOnly: boolean;
	description: string;
	commands: Command[];
	file: string;
	constructor(d: {
		name: string;
		displayName?: string;
		devOnly?: boolean;
		description?: string;
		file: string;
	}) {
		this.name = d.name;
		this.displayName = d.displayName || `{lang:category.${d.name}.displayName}`;
		this.devOnly = !!d.devOnly;
		this.description = d.description || `{lang:category.${d.name}.description}`;
		this.commands = [];
		this.file = d.file;
	}

	get commandTriggers(): string[] {
		return this.commands.map(c => c.triggers).reduce((a, b) => a.concat(b), []);
	}

	addCommand(cmd: Command) {
		if (this.commands.includes(cmd)) throw new TypeError("Command already present in category.");
		this.commands.push(cmd);
		// removed due to being spammy
		// Logger.debug("Command Handler", `Added the command "${cmd.triggers[0]}" to the category "${this.name}".`);
		return cmd;
	}

	removeCommand(triggerOrCmd: string | Command) {
		if (typeof triggerOrCmd === "string") {
			const cmd = this.commands.find(c => c.triggers.includes(triggerOrCmd));
			if (!cmd) return false;
			this.commands.splice(this.commands.indexOf(cmd), 1);
			Logger.debug("Command Handler", `Removed the command "${cmd.triggers[0]}" from the category "${this.name}".`);
			return true;
		} else {
			if (!this.commands.includes(triggerOrCmd)) return false;
			this.commands.splice(this.commands.indexOf(triggerOrCmd), 1);
			Logger.debug("Command Handler", `Removed the command "${triggerOrCmd.triggers[0]}" from category "${this.name}".`);
			return true;
		}
	}
}
