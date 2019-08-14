import FurryBot from "@FurryBot";
import ExtendedMessage from "../extended/ExtendedMessage";
import CommandCreateError from "../cmd/CommandCreateError";
import * as fs from "fs";
import Category from "./Category";

type ArrayOneOrMore<T> = {
	0: T
} & T[];

interface PartialCategory {
	name: string;
	displayName: string;
	description: string;
	path: string;
}

class Command {
	triggers: string[] /*ArrayOneOrMore<string>*/;
	userPermissions: string[];
	botPermissions: string[];
	cooldown: number;
	description: string;
	usage: string;
	hasSubCommands: boolean;
	subCommands: Command[] | null;
	nsfw: boolean;
	devOnly: boolean;
	betaOnly: boolean;
	guildOwnerOnly: boolean;
	path: string;
	run: (this: FurryBot, message: ExtendedMessage) => any;
	category: PartialCategory;
	constructor(data: {
		triggers: string[] /*ArrayOneOrMore<string>*/; // change back when all commands have been made
		userPermissions?: string[];
		botPermissions?: string[];
		cooldown?: number;
		description?: string;
		usage?: string;
		hasSubCommands?: boolean;
		subCommands?: Command[];
		nsfw?: boolean;
		devOnly?: boolean;
		betaOnly?: boolean;
		guildOwnerOnly?: boolean;
		path: string;
	}, run: (message: ExtendedMessage) => any) {
		if (!data.triggers || data.triggers.length === 0) {
			/* throw new CommandCreateError("Invalid trigger list provided."); */ // uncomment when all commands have been made
			data.triggers = ["notavalidcommand"];
		}
		this.triggers = data.triggers;
		this.userPermissions = !data.userPermissions ? [] : data.userPermissions;
		this.botPermissions = !data.botPermissions ? [] : data.botPermissions;
		this.cooldown = [undefined, null].includes(data.cooldown) ? 0 : data.cooldown;
		this.description = !data.description ? "None Provided" : data.description;
		this.usage = !data.usage ? "" : data.usage;
		this.hasSubCommands = [undefined, null].includes(data.hasSubCommands) ? null : data.hasSubCommands;
		this.subCommands = [undefined, null].includes(data.subCommands) ? null : data.subCommands;
		this.nsfw = [undefined, null].includes(data.nsfw) ? false : data.nsfw;
		this.devOnly = [undefined, null].includes(data.devOnly) ? false : data.devOnly;
		this.betaOnly = [undefined, null].includes(data.betaOnly) ? false : data.betaOnly;
		this.guildOwnerOnly = [undefined, null].includes(data.guildOwnerOnly) ? false : data.guildOwnerOnly;
		// this.category = [undefined, null].includes(data.category) ? null : data.category;
		if (!data.path) throw new CommandCreateError("Invalid path provided.");
		this.path = data.path;
		if (!run) throw new CommandCreateError("Invalid run provided.");
		this.run = run;

		// TODO: add auto subcommand detection system here

		if (this.hasSubCommands === null) {

		}

		if (this.subCommands === null) {

		}

		// TODO: add auto category detection here

		if (this.category === null) {

		}
	}
}

module.exports = Command;
export default Command;