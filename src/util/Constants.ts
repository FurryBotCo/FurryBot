import Eris, { Constants as EConst } from "eris";

/* tslint:disable variable-name */
const ECHTypes = EConst.ChannelTypes;
const EMSGTypes = EConst.MessageTypes;
const EMSGFlags = EConst.MessageFlags;

export const GameTypes = {
	PLAYING: 0 as 0,
	STREAMING: 1 as 1,
	LISTENING: 2 as 2,
	WATCHING: 3 as 3
};

export const ChannelNames = {
	[ECHTypes.DM]: "Direct Message",
	[ECHTypes.GUILD_TEXT]: "Text",
	[ECHTypes.GROUP_DM]: "Group Direct Message",
	[ECHTypes.GUILD_VOICE]: "Voice",
	[ECHTypes.GUILD_NEWS]: "News",
	[ECHTypes.GUILD_STORE]: "Store"
};

export const ChannelNamesCamelCase = {
	[ECHTypes.DM]: "directMessage",
	[ECHTypes.GUILD_TEXT]: "text",
	[ECHTypes.GROUP_DM]: "groupDirectMessage",
	[ECHTypes.GUILD_VOICE]: "voice",
	[ECHTypes.GUILD_NEWS]: "news",
	[ECHTypes.GUILD_STORE]: "store"
};

export const MessageTypes = {
	[EMSGTypes.DEFAULT]: "Regular",
	[EMSGTypes.RECIPIENT_ADD]: "Recipient Add (System)",
	[EMSGTypes.RECIPIENT_REMOVE]: "Recipient Remove (System)",
	[EMSGTypes.CALL]: "Call (System)",
	[EMSGTypes.CHANNEL_NAME_CHANGE]: "Channel Name Change (System)",
	[EMSGTypes.CHANNEL_ICON_CHANGE]: "Channel Icon Change (System)",
	[EMSGTypes.CHANNEL_PINNED_MESSAGE]: "Pinned Message (System)",
	[EMSGTypes.GUILD_MEMBER_JOIN]: "Guild Memebr Join (System)",
	[EMSGTypes.USER_PREMIUM_GUILD_SUBSCRIPTION]: "Premium Subscription (System)",
	[EMSGTypes.USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1]: "Premium Subscription Tier 1 (System)",
	[EMSGTypes.USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2]: "Premium Subscription Tier 2 (System)",
	[EMSGTypes.USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3]: "Premium Subscription Tier 3 (System)",
	[EMSGTypes.CHANNEL_FOLLOW_ADD]: "Channel Follow Add (System)"
};

export const MessageFlags = {
	[EMSGFlags.CROSSPOSTED]: "Crossposted",
	[EMSGFlags.IS_CROSSPOST]: "Is Crosspost",
	[EMSGFlags.SUPPRESS_EMBEDS]: "Suppress Embeds",
	[EMSGFlags.SOURCE_MESSAGE_DELETED]: "Source Message Deleted",
	[EMSGFlags.URGENT]: "Urgent"
};

// stored as octals as to make knowing hex easier
export const Colors = {
	blue: 0x4169e1,
	green: 0x2ecc71,
	gold: 0xf1c40f,
	red: 0xcd0000,
	orange: 0xd2691e,
	fur: 0x4d8abe
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

/* tslint:enable variable-name */
