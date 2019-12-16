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
	const textChCount = msg.guild.channels.filter(c => c.type === 0).length,
		voiceChCount = msg.guild.channels.filter(c => c.type === 2).length,
		categoryChCount = msg.guild.channels.filter(c => c.type === 4).length;
	let owner;
	const o = msg.guild.members.find(m => m.id === msg.guild.ownerID);
	if (!o) {
		owner = "Unknown";
	} else {
		owner = `${o.user.username}#${o.user.discriminator} (${o.id})`;
	}

	let features = "";

	const f = {
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

	Object.keys(f).forEach((k) => msg.guild.features.includes(k) ? features += `**${k}** - ${f[k]}\n` : null);
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
	const roles = msg.guild.roles.map(role => role.name === "@everyone" ? "@everyone" : `<@&${role.id}>`).join(",");
	const rr = roles.length > 1000 ? `Too many to list.` : roles;
	const embed = {
		title: `Server Info - **${msg.guild.name}**`,
		image: {
			url: msg.guild.iconURL
		},
		fields: [
			{
				name: "Guild ID",
				value: msg.channel.guild.id,
				inline: false
			},
			{
				name: "Guild Owner",
				value: owner,
				inline: false
			},
			{
				name: "Members",
				value: [
					`Total: ${msg.guild.memberCount}`,
					"",
					`<:${config.emojis.online}>: ${msg.guild.members.filter(m => m.status === "online").length}`,
					`<:${config.emojis.idle}>: ${msg.guild.members.filter(m => m.status === "idle").length}`,
					`<:${config.emojis.dnd}>: ${msg.guild.members.filter(m => m.status === "dnd").length}`,
					`<:${config.emojis.offline}>: ${msg.guild.members.filter(m => m.status === "offline").length}`,
					"",
					`Non Bots: ${msg.channel.guild.members.filter(m => !m.bot).length}`,
					`Bots: ${msg.channel.guild.members.filter(m => m.bot).length}`
				].join("\n"),
				inline: false
			},
			{
				name: "Channels",
				value: `Total: ${msg.guild.channels.size}\n\
	Text: ${textChCount}\n\
	Voice: ${voiceChCount}\n\
	Category: ${categoryChCount}`,
				inline: false
			},
			{
				name: "Guild Creation Date",
				value: new Date(msg.guild.createdAt).toString().split("GMT")[0],
				inline: false
			},
			{
				name: "Region",
				value: msg.guild.region,
				inline: false
			},
			{
				name: `Roles [${msg.guild.roles.size - 1}]`,
				value: rr,
				inline: false
			},
			{
				name: "Extra",
				value: `**Large Guild**: ${msg.guild.large ? "Yes" : "No"}\n**Verification**: ${verificationLevel[msg.guild.verificationLevel]}\n**2FA**: ${mfaLevel[msg.guild.mfaLevel]}\n**Default Notifications**: ${defaultNotifications[msg.guild.defaultNotifications]}\n**[Features](https://discordapp.com/developers/docs/resources/guild#guild-object-guild-features)**:\n${features}`,
				inline: false
			}/*, {
	name: "Counters",
	value: !s ? "Guild is too large to display counts." : `OwO Counts: ${s.map(j => j.owoCount).reduce((a, b) => a + b)}\nUwU Counts: ${s.map(j => j.uwuCount).reduce((a, b) => a + b)}`,
	inline: false
			}*/
		],
		timestamp: new Date().toISOString(),
		color: this.f.randomColor()
	};

	return msg.channel.createMessage({ embed });
}));
