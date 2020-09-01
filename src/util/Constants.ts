import FullColors from "../config/other/colors.json";
import Eris from "eris";

export const Colors = {
	gold: 0xFFD700,
	orange: 0xFFA500,
	red: 0xDC143C,
	green: 0x008000,
	white: 0xFFFFFF,
	black: 0x000000,
	brown: 0x8B4513,
	pink: 0xFFC0CB,
	hotPink: 0xFF69B4,
	deepPink: 0xFF1493,
	violet: 0xEE82EE,
	magenta: 0xFF00FF,
	darkViolet: 0x9400D3,
	purple: 0x800080,
	indigo: 0x4B0082,
	maroon: 0x800000,
	cyan: 0x00FFFF,
	teal: 0x008080,
	blue: 0x0000FF,
	get random() { return Math.floor(Math.random() * 0xFFFFFF); },
	Full: FullColors
};

export const GAME_TYPES = {
	PLAYING: 0,
	STREAMING: 1,
	LISTENING: 2,
	WATCHING: 3,
	CUSTOM: 4
} as const;


export const ChannelNames = {
	[Eris.Constants.ChannelTypes.GUILD_TEXT]: "Text",
	[Eris.Constants.ChannelTypes.DM]: "Direct Message",
	[Eris.Constants.ChannelTypes.GUILD_VOICE]: "Voice",
	[Eris.Constants.ChannelTypes.GUILD_CATEGORY]: "Category",
	[Eris.Constants.ChannelTypes.GROUP_DM]: "Group Direct Message",
	[Eris.Constants.ChannelTypes.GUILD_NEWS]: "News",
	[Eris.Constants.ChannelTypes.GUILD_STORE]: "Store"
};

export const Permissions = {
	constant: Eris.Constants.Permissions,
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
