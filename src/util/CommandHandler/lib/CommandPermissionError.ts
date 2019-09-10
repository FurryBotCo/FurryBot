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

export default class CommandPermissionError extends Error {
	type: "CLIENT" | "USER";
	permission: ErisPermissions;
	constructor(type: "CLIENT" | "USER", permission: ErisPermissions) {
		super(`ERR_${type.toUpperCase()}_MISSING_${permission}`);
		this.type = type.toUpperCase() as "CLIENT" | "USER";
		this.permission = permission;
	}
}