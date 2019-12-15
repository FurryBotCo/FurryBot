import { Constants } from "eris";

// remove Eris specific "permissions"
// const constant: Omit<Constants["Permissions"], "all" | "allGuild" | "allText" | "allVoice"> = Constants.Permissions;
/* tslint:disable no-string-literal */
// delete constant["all"];
// delete constant["allGuild"];
// delete constant["allText"];
// delete constant["allVoice"];
/* tslint:enable no-string-literal */
export default {
	constant: Constants.Permissions,
	conversion: {
		CREATE_INSTANT_INVITE: "createInstantInvite", // 1
		KICK_MEMBERS: "kickMembers", // 2
		BAN_MEMBERS: "banMembers", // 4
		ADMINISTRATOR: "administrator", // 8
		MANAGE_CHANNELS: "manageChannels", // 16
		MANAGE_GUILD: "manageGuild", // 32
		ADD_REACTIONS: "addReactions", // 64
		VIEW_AUDIT_LOG: "viewAuditLogs", // 128
		PRIORITY_SPEAKER: "voicePrioritySpeaker", // 256
		READ_MESSAGES: "readMessages", // 1024
		SEND_MESSAGES: "sendMessages", // 2048
		SEND_TTS_MESSAGES: "sendTTSMessages", // 4096
		MANAGE_MESSAGES: "manageMessages", // 8192
		EMBED_LINKS: "embedLinks", // 16384
		ATTACH_FILES: "attachFiles", // 32768
		READ_MESSAGE_HISTORY: "readMessageHistory", // 65536
		MENTION_EVERYONE: "mentionEveryone", // 131072
		USE_EXTERNAL_EMOJIS: "externalEmojis", // 262144
		CONNECT: "voiceConnect", // 1048576
		SPEAK: "voiceSpeak", // 2097152
		MUTE_MEMBERS: "voiceMuteMembers", // 4194304
		DEAFEN_MEMBERS: "voiceDeafenMembers", // 8388608
		MOVE_MEMBERS: "voiceMoveMembers", // 16777216
		USE_VAD: "voiceUseVAD", // 33554432
		CHANGE_NICKNAME: "changeNickname", // 67108864
		MANAGE_NICKNAMES: "manageNicknames",	// 134217728
		MANAGE_ROLES: "manageRoles", // 268435456
		MANAGE_WEBHOOKS: "manageWebhooks", // 536870912
		MANAGE_EMOJIS: "manageEmojis", // 1073741824
		/**
		 * Fake permission from eris containing all permissions
		 */
		ALL: "all",
		/**
		 * Fake permission from eris containing all guild permissions
		 */
		ALL_GUILD: "allGuild",
		/**
		 * Fake permission from eris containing all text permissions
		 */
		ALL_TEXT: "allText",
		/**
		 * Fake permission from eris containing all voice permissions
		 */
		ALL_VOICE: "allVoice"
	}
};
