import Command from "./Command";
import CommandHandler from "./CommandHandler";

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

export default class Category {
	private _name: string;
	private _displayName: string;
	private _devOnly: boolean;
	private _descripion: string;
	private _commands: Command[];
	private _handler: CommandHandler;
	constructor(data: {
		name: string;
		displayName?: string;
		devOnly?: boolean;
		description?: string;
		commands?: Command[];
	}, h: CommandHandler) {
		if (!data.name) throw new TypeError("Missing category name.");
		if (!data.displayName) data.displayName = data.name;
		if (!data.devOnly) data.devOnly = false;
		if (!data.description) data.description = "None Provided.";
		if (!data.commands) data.commands = [];
		this._name = data.name;
		this._displayName = data.displayName;
		this._devOnly = data.devOnly;
		this._descripion = data.description;
		this._commands = data.commands;
		this._handler = h;
	}

	get name() {
		return this._name;
	}

	get displayName() {
		return this._displayName;
	}

	get devOnly() {
		return this._devOnly;
	}

	get description() {
		return this._descripion;
	}

	get commands() {
		return [...this._commands];
	}

	get commandTriggers() {
		return this.commands.map(c => c.triggers).reduce((a: any, b: any) => a.concat(b), []);
	}

	addCommand(cmd: Command): this {
		this._commands.push(cmd);
		return this;
	}
}
