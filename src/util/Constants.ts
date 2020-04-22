import { Constants as EConst } from "eris";

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

/* tslint:enable variable-name */
