/// <reference path="../../util/@types/global.d.ts" />
import Eris from "eris";
import { CommandRestrictions, ErisPermissions } from "../../util/@types/cmd";
import UserConfig from "../config/UserConfig";
import GuildConfig from "../config/GuildConfig";
import FurryBot from "../../main";
import ExtendedMessage from "../ExtendedMessage";


export default class Command {
	triggers: ArrayOneOrMore<string>;
	permissions: {
		user: ErisPermissions[];
		bot: ErisPermissions[];
	};
	cooldown: number;
	donatorCooldown: number;
	description: string;
	usage: string;
	restrictions: CommandRestrictions[];
	category: string;
	file: string;
	run: (this: FurryBot, msg: ExtendedMessage<Eris.GuildTextableChannel>, uConfig: UserConfig, gConfig: GuildConfig, cmd: Command) => any;
	constructor(
		d: {
			triggers: ArrayOneOrMore<string>;
			permissions?: {
				user?: ErisPermissions[];
				bot?: ErisPermissions[];
			};
			cooldown?: number;
			donatorCooldown?: number;
			description?: string;
			usage?: string;
			restrictions?: CommandRestrictions[];
			category?: string;
			subCommands?: Command[];
			file: string;
		},
		run: (this: FurryBot, msg: ExtendedMessage<Eris.GuildTextableChannel>, uConfig: UserConfig, gConfig: GuildConfig, cmd: Command) => any
	) {
		this.triggers = d.triggers;
		this.permissions = {
			user: d.permissions && d.permissions.user ? d.permissions.user : [],
			bot: d.permissions && d.permissions.bot ? d.permissions.bot : []
		};
		this.cooldown = ![undefined, null].includes(d.cooldown) ? d.cooldown : 0;
		this.donatorCooldown = ![undefined, null].includes(d.donatorCooldown) ? d.donatorCooldown : this.cooldown;
		this.description = d.description || "";
		this.usage = d.usage || "";
		this.restrictions = d.restrictions || [];
		this.category = d.category || null;
		this.file = d.file;
		this.run = run;
	}

	setCategory(name: string) {
		this.category = name;
		if (!this.description) this.description = `{lang:commands.${name}.${this.triggers[0]}.description}`;
		if (!this.usage) this.usage = `{lang:commands.${name}.${this.triggers[0]}.usage}`;
		return this;
	}
}
