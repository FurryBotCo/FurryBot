import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

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
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const o: Eris.User = await this.getRESTUser(msg.guild.ownerID).catch(err => null);
	const owner = !o ? `Unknwon ${msg.channel.guild.ownerID}` : `${o.username}#${o.discriminator} (${o.id})`;

	const fStr = {
		INVITE_SPLASH: "Invite Splash",
		VIP_REGIONS: "Vip Voice Regions/320kbps Voice Channels",
		VANITY_URL: "Vanity URL",
		VERIFIED: "Verified",
		PARTNERED: "Partnered",
		LURKABLE: "Lurkable",
		COMMERCE: "Store Channels",
		NEWS: "News Channels",
		DISCOVERABLE: "Discoverable",
		FEATURABLE: "Featurable",
		ANIMATED_ICON: "Animated Icon",
		BANNER: "Guild Banner",
		PUBLIC: "Public"
	};

	let features = msg.channel.guild.features.map(f => fStr[f] || `${f}`).join("\n");
	if (features === "") features = "NONE";

	const verificationLevel = [
		"**NONE** - unrestricted",
		"**LOW** - 	must have verified email on account",
		"**MEDIUM** - 	must be registered on Discord for longer than 5 minutes",
		"**HIGH** - (╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes",
		"**VERY HIGH** - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number"
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

	const embed = {
		title: `Server Info - **${msg.guild.name}**`,
		image: {
			url: msg.guild.iconURL
		},
		fields: [
			{
				name: "Guild ID",
				value: msg.channel.guild.id,
				inline: true
			},
			{
				name: "Guild Owner",
				value: owner,
				inline: true
			},
			{
				name: "Region",
				value: msg.guild.region,
				inline: true
			},
			{
				name: "Members",
				value: [
					`Total: ${msg.guild.memberCount} ([note](https://botapi.furry.bot/note/sinfo 'status counts are based on cached users, and may not include all server members'))`,
					"",
					`<:${config.emojis.online}>: ${msg.guild.members.filter(m => m.status === "online").length}`,
					`<:${config.emojis.idle}>: ${msg.guild.members.filter(m => m.status === "idle").length}`,
					`<:${config.emojis.dnd}>: ${msg.guild.members.filter(m => m.status === "dnd").length}`,
					`<:${config.emojis.offline}>: ${msg.guild.members.filter(m => m.status === "offline").length}`,
					"",
					`Non Bots: ${msg.channel.guild.members.filter(m => !m.bot).length}`,
					`Bots: ${msg.channel.guild.members.filter(m => m.bot).length}`
				].join("\n"),
				inline: true
			},
			{
				name: "Channels",
				value: [
					`Total: ${msg.channel.guild.channels.size}`,
					`Text: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_TEXT).length}`,
					`Voice: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_VOICE).length}`,
					`Category: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_CATEGORY).length}`,
					`News: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_NEWS).length}`,
					`Store: ${msg.channel.guild.channels.filter(c => c.type === Eris.Constants.ChannelTypes.GUILD_STORE).length}`
				].join("\n"),
				inline: true
			},
			{
				name: "Guild Creation Date",
				value: this.f.formatDateWithPadding(new Date(msg.guild.createdAt), true),
				inline: true
			},
			{
				name: "Features",
				value: features,
				inline: true
			},
			{
				name: "Nitro Boosters",
				value: `Nitro Boosts: ${msg.channel.guild.premiumSubscriptionCount || "None"}\nBoost Tier: ${msg.channel.guild.premiumTier || "None"}`,
				inline: true
			},
			{
				name: "UwU",
				value: "ÓwÒ what's this?!?",
				inline: true
			},
			{
				name: "Extra",
				value: `**Large Guild**: ${msg.guild.large ? "Yes" : "No"}\n**Verification**: ${verificationLevel[msg.guild.verificationLevel]}\n**2FA**: ${mfaLevel[msg.guild.mfaLevel]}\n**Default Notifications**: ${defaultNotifications[msg.guild.defaultNotifications]}${msg.channel.guild.features.includes("VANITY_URL") ? `\nVanity URL: [https://discord.gg/${msg.channel.guild.vanityURL}](https://discord.gg/${msg.channel.guild.vanityURL})` : ""}`,
				inline: false
			}
		],
		timestamp: new Date().toISOString(),
		color: Math.floor(Math.random() * 0xFFFFFF)
	};

	return msg.channel.createMessage({ embed });
}));
