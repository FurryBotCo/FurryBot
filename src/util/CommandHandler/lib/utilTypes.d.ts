export type ErisPermissions =
	"createInstantInvite" | "kickMembers" | "banMembers" | "administrator" | "manageChannels" |
	"manageGuild" | "addReactions" | "readMessages" | "sendMessages" | "sendTTSMessages" |
	"manageMessages" | "embedLinks" | "attachFiles" | "readMessageHistory" | "mentionEveryone" |
	"externalEmojis" | "voiceConnect" | "voiceSpeak" | "voiceMuteMembers" | "voiceDeafenMembers" |
	"voiceMoveMembers" | "voiceUseVAD" | "changeNickname" | "manageNicknames" | "manageRoles" |
	"manageWebhooks" | "manageEmojis" |
	"all" | "allGuild" | "allText" | "allVoice"; // these are eris specific, not true permissions

export type ArrayOneOrMore<T> = {
	0: T;
} & T[];
