import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import * as Eris from "eris";
import { Time } from "../../util/Functions";

export default new Command({
	triggers: [
		"sinfo",
		"serverinfo",
		"server",
		"si"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get some info about the current server.",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const o: Eris.User = await this.getRESTUser(msg.guild.ownerID).catch(err => null);
	const owner = !o ? `Unknown ${msg.channel.guild.ownerID}` : `${o.username}#${o.discriminator} (${o.id})`;

	const fDocsUrl = "https://discordapp.com/developers/docs/resources/guild#guild-object-guild-features";
	const fStr = {
		INVITE_SPLASH: `[Invite Splash](${fDocsUrl} 'guild has access to set an invite splash background')`,
		VIP_REGIONS: `[Vip Voice Regions/320kbps Voice Channels](${fDocsUrl} 'guild has access to set 384kbps bitrate in voice (previously VIP voice servers)')`,
		VANITY_URL: `[Vanity URL](${fDocsUrl} 'guild has access to set a vanity URL')`,
		VERIFIED: `[Verified](${fDocsUrl} 'guild is verified')`,
		PARTNERED: `[Partnered](${fDocsUrl} 'guild is partnered')`,
		PUBLIC: `[Public](${fDocsUrl} 'guild is public')`,
		COMMERCE: `[Store Channels](${fDocsUrl} 'guild has access to use commerce features (i.e. create store channels)')`,
		NEWS: `[News Channels](${fDocsUrl} 'guild has access to create news channels')`,
		DISCOVERABLE: `[Discoverable](${fDocsUrl} 'guild is able to be discovered in the directory')`,
		FEATURABLE: `[Featurable](${fDocsUrl} 'guild is able to be featured in the directory')`,
		ANIMATED_ICON: `[Animated Icon](${fDocsUrl} 'guild has access to set an animated guild icon')`,
		BANNER: `[Guild Banner](${fDocsUrl} 'guild has access to set a guild banner image')`
	};

	let features = msg.channel.guild.features.map(f => `\u25FD ${fStr[f] || `${f}`}`).join("\n");
	if (features === "") features = "\u25FD NONE";

	const verificationLevel = [
		"[NONE](https://furry.bot 'unrestricted')",
		"[LOW](https://furry.bot 'must have verified email on account')",
		"[MEDIUM](https://furry.bot 'must be registered on Discord for longer than 5 minutes')",
		"[HIGH](https://furry.bot '(╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes')",
		"[VERY HIGH](https://furry.bot '┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number')"
	];
	// let s;
	// if (msg.channel.guild.memberCount < 1000) s = await Promise.all(msg.guild.members.filter(m => !m.user.bot).map((m) => mdb.collection("users").findOne({ id: m.id }))).then(res => res.map(m => m === null ? config.defaults.userConfig : m).map(m => ({ owoCount: m.owoCount === undefined ? 0 : m.owoCount, uwuCount: m.uwuCount === undefined ? 0 : m.uwuCount })));
	// else s = false;
	const mfaLevel = [
		"Not Enabled",
		"Enabled"
	];

	const defaultNotifications = [
		"All Messages",
		"Only Mentions"
	];

	return msg.channel.createMessage({
		embed: {
			title: `Server Info - **${msg.guild.name}**`,
			image: {
				url: msg.guild.iconURL
			},
			description: [
				`\u25FD Name: **${msg.channel.guild.name}**`,
				`\u25FD ID: **${msg.channel.guild.id}**`,
				`\u25FD Owner:** ${owner}**`,
				`\u25FD Region: **${msg.channel.guild.region}**`,
				`\u25FD Creation Date: **${Time.formatDateWithPadding(msg.channel.guild.createdAt, true)}**`,
				`\u25FD Nitro Boosts: **${msg.channel.guild.premiumSubscriptionCount || "None"}**`,
				`\u25FD Boost Tier: **${msg.channel.guild.premiumTier || "None"}**`,
				`\u25FD Large: **${msg.channel.guild.large ? "Yes" : "No"}**`,
				`\u25FD Verification Level: **${verificationLevel[msg.channel.guild.verificationLevel]}**`,
				`\u25FD 2FA Requirement: **${mfaLevel[msg.channel.guild.mfaLevel]}**`,
				`\u25FD Default Notifications: **${defaultNotifications[msg.channel.guild.defaultNotifications]}**`,
				`\u25FD Vanity URL: **${msg.channel.guild.features.includes("VANITY_URL") ? `[https://discord.gg/${msg.channel.guild.vanityURL}](https://discord.gg/${msg.channel.guild.vanityURL})` : "None"}**`,
				"",
				`**[Features](${fDocsUrl})**:`,
				features,
				"",
				"**Members**:",
				`\u25FD Total: ${msg.guild.memberCount} ([note](https://botapi.furry.bot/note/sinfo 'status counts are based on cached users, and may not include all server members'))`,
				`\u25FD <:${config.emojis.online}>: ${msg.guild.members.filter(m => m.status === "online").length}`,
				`\u25FD <:${config.emojis.idle}>: ${msg.guild.members.filter(m => m.status === "idle").length}`,
				`\u25FD <:${config.emojis.dnd}>: ${msg.guild.members.filter(m => m.status === "dnd").length}`,
				`\u25FD <:${config.emojis.offline}>: ${msg.guild.members.filter(m => m.status === "offline").length}`,
				`\u25FD Non Bots: ${msg.channel.guild.members.filter(m => !m.bot).length}`,
				`\u25FD Bots: ${msg.channel.guild.members.filter(m => m.bot).length}`,
				"",
				"**Channels**:",
				`\u25FD Total: ${msg.channel.guild.channels.size}`,
				`\u25FD Text: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_TEXT).length}`,
				`\u25FD Voice: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_VOICE).length}`,
				`\u25FD Category: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_CATEGORY).length}`,
				`\u25FD News: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_NEWS).length}`,
				`\u25FD Store: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_STORE).length}`,
				"",
				`\u25FD Hidden (for you): ${msg.channel.guild.channels.filter(c => !c.permissionsOf(msg.author.id).has("readMessages")).length}`,
				`\u25FD Visible (for you): ${msg.channel.guild.channels.filter(c => c.permissionsOf(msg.author.id).has("readMessages")).length}`,
				"",
				`\u25FD Hidden (for me): ${msg.channel.guild.channels.filter(c => !c.permissionsOf(this.user.id).has("readMessages")).length}`,
				`\u25FD Visible (for me): ${msg.channel.guild.channels.filter(c => c.permissionsOf(this.user.id).has("readMessages")).length}`
			].join("\n"),
			timestamp: new Date().toISOString(),
			color: Math.floor(Math.random() * 0xFFFFFF)
		}
	});
}));
