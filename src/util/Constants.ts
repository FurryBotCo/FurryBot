import { Constants as EConst } from "eris";

/* tslint:disable variable-name */

const ChannelNames = {
	[EConst.ChannelTypes.DM]: "Direct Message",
	[EConst.ChannelTypes.GUILD_TEXT]: "Text",
	[EConst.ChannelTypes.GROUP_DM]: "Group Direct Message",
	[EConst.ChannelTypes.GUILD_VOICE]: "Voice",
	[EConst.ChannelTypes.GUILD_NEWS]: "News",
	[EConst.ChannelTypes.GUILD_STORE]: "Store"
};

const ChannelNamesCamelCase = {
	[EConst.ChannelTypes.DM]: "directMessage",
	[EConst.ChannelTypes.GUILD_TEXT]: "text",
	[EConst.ChannelTypes.GROUP_DM]: "groupDirectMessage",
	[EConst.ChannelTypes.GUILD_VOICE]: "voice",
	[EConst.ChannelTypes.GUILD_NEWS]: "news",
	[EConst.ChannelTypes.GUILD_STORE]: "store"
};


/* tslint:enable variable-name */

export { ChannelNames };
export { ChannelNamesCamelCase };
