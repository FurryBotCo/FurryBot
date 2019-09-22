/**
 * Copied from Furry Bot
 * https://github.com/FurryBotCo/FurryBot/blob/master/src/util/CommandHandler/lib/Command.ts
 * Licensed under AGPL-3.0, https://github.com/FurryBotCo/FurryBot/blob/master/LICENSE, https://github.com/FurryBotCo/SpotiJS/blob/master/LICENSE
 */

import * as Eris from "eris";
import Category from "./Category";
import CommandHandler from "./CommandHandler";
import ExtendedMessage from "modules/extended/ExtendedMessage";

type ArrayOneOrMore<T> = {
	0: T
} & T[];

type ErisPermissions =
	"createInstantInvite" | "kickMembers" | "banMembers" | "administrator" | "manageChannels" |
	"manageGuild" | "addReactions" | "readMessages" | "sendMessages" | "sendTTSMessages" |
	"manageMessages" | "embedLinks" | "attachFiles" | "readMessageHistory" | "mentionEveryone" |
	"externalEmojis" | "voiceConnect" | "voiceSpeak" | "voiceMuteMembers" | "voiceDeafenMembers" |
	"voiceMoveMembers" | "voiceUseVAD" | "changeNickname" | "manageNicknames" | "manageRoles" |
	"manageWebhooks" | "manageEmojis" |
	"all" | "allGuild" | "allText" | "allVoice"; // these are eris specific, not true permissions

export default class Command {
	private _subcommand: boolean;
	private _triggers: ArrayOneOrMore<string>;
	private _userPermissions: ErisPermissions[];
	private _botPermissions: ErisPermissions[];
	private _cooldown: number;
	private _donatorCooldown: number;
	private _description: string;
	private _usage: string;
	private _features: ("nsfw" | "devOnly" | "betaOnly" | "donatorOnly" | "guildOwnerOnly")[];
	private _subCommands: Command[];
	private _category: Category;
	private _run: (this: any, msg: ExtendedMessage, cmd: Command) => Promise<any>;
	private _handler: CommandHandler;

	constructor(subcommand: true, data: {
		triggers: ArrayOneOrMore<string>;
		userPermissions?: ErisPermissions[];
		botPermissions?: ErisPermissions[];
		cooldown?: number;
		donatorCooldown?: number;
		description?: string;
		usage?: string;
		features?: ("nsfw" | "devOnly" | "betaOnly" | "donatorOnly" | "guildOwnerOnly")[];
		subCommands?: Command[];
		category?: Category | string;
		run: (this: any, msg: ExtendedMessage, cmd: Command) => Promise<any>;
	}, h: CommandHandler, client?: any);

	constructor(subcommand: false, data: {
		triggers: ArrayOneOrMore<string>;
		userPermissions?: ErisPermissions[];
		botPermissions?: ErisPermissions[];
		cooldown?: number;
		donatorCooldown?: number;
		description?: string;
		usage?: string;
		features?: ("nsfw" | "devOnly" | "betaOnly" | "donatorOnly" | "guildOwnerOnly")[];
		subCommands?: Command[];
		category: Category | string;
		run: (this: any, msg: ExtendedMessage) => Promise<any>;
	}, h: CommandHandler, client?: any);

	constructor(subcommand: boolean, data: {
		triggers: ArrayOneOrMore<string>;
		userPermissions?: ErisPermissions[];
		botPermissions?: ErisPermissions[];
		cooldown?: number;
		donatorCooldown?: number;
		description?: string;
		usage?: string;
		features?: ("nsfw" | "devOnly" | "betaOnly" | "donatorOnly" | "guildOwnerOnly")[];
		subCommands?: Command[];
		category: Category | string;
		run: (this: any, msg: ExtendedMessage, cmd: Command) => Promise<any>;
	}, h: CommandHandler, client?: any) {
		if (!data.triggers) throw new TypeError("Missing triggers property.");
		if (!(data.triggers instanceof Array)) throw new TypeError("Invalid triggers property.");
		if (data.triggers.length < 1) throw new TypeError("Not enough triggers. (must have at least 1)");
		if (!data.userPermissions) data.userPermissions = [];
		if (!data.botPermissions) data.botPermissions = [];
		if (!data.cooldown) data.cooldown = 0;
		if (!data.donatorCooldown) data.donatorCooldown = data.cooldown;
		if (!data.description) data.description = "None provided.";
		if (!data.usage) data.usage = "";
		if (!data.features) data.features = [];
		if (data.features && data.features.length > 0) {
			if (!data.features.some(d => ["nsfw", "devOnly", "betaOnly", "donatorOnly", "guildOwnerOnly"].map(f => f.toLowerCase()).includes(d.toLowerCase()))) throw new TypeError("Invalid command features.");
		}
		if (!data.subCommands) data.subCommands = [];

		if (!subcommand) {
			if (!data.category) throw new TypeError("Missing category.");
			if (data.category instanceof Category) data.category = data.category.name;
			else if (!h.getCategory(data.category)) throw new TypeError("Invalid category provided.");
		}

		if (!data.run) throw new TypeError("Missing run function.");

		this._subcommand = subcommand;
		this._triggers = data.triggers;
		this._userPermissions = data.userPermissions;
		this._botPermissions = data.botPermissions;
		this._cooldown = data.cooldown;
		this._donatorCooldown = data.donatorCooldown;
		this._description = data.description;
		this._usage = data.usage;
		this._features = data.features;
		this._subCommands = data.subCommands;
		this._category = subcommand ? null : h.getCategory(data.category as string);
		this._run = data.run;
		this._handler = h;
	}

	get subcommand() {
		return this._subcommand;
	}

	get triggers() {
		return [...this._triggers];
	}

	get userPermissions() {
		return [...this._userPermissions];
	}

	get botPermissions() {
		return [...this._botPermissions];
	}

	get cooldown() {
		return this._cooldown;
	}

	get donatorCooldown() {
		return this._donatorCooldown;
	}

	get description() {
		return this._description;
	}

	get usage() {
		return this._usage;
	}

	get features() {
		return this._features;
	}

	get subCommands() {
		return this._subCommands;
	}

	get category() {
		return this._category;
	}

	get run() {
		return this._run;
	}
}