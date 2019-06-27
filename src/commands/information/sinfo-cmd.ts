import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

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
	description: "Get some info about the current server",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let textChCount = msg.guild.channels.filter(c => c.type === 0).length,
		voiceChCount = msg.guild.channels.filter(c => c.type === 2).length,
		categoryChCount = msg.guild.channels.filter(c => c.type === 4).length,
		embed, o, owner, features, mfaLevel, verificationLevel, defaultNotifications, roles, rr;

	o = msg.guild.members.find(m => m.id === msg.guild.ownerID);
	if (!o) {
		owner = "Unknown";
	} else {
		owner = `${o.user.username}#${o.user.discriminator} (${o.id})`;
	}
	features = "";
	//if (msg.channel.guild.verified) features += "Verified\n";
	if (msg.channel.guild.features.indexOf("VIP_REGIONS") !== -1) features += "VIP Voice Vegions\n";
	// if fetching vanity url fails return discord-api
	if (msg.channel.guild.features.indexOf("VANITY_URL") !== -1) features += "Vanity URL\n"; // features+=`Vanity URL: https://discord.gg/${msg.guild.fetchVanityCode().catch(noerr => "discord-api")}\n`;
	if (msg.channel.guild.features.indexOf("INVITE_SPLASH") !== -1) features += "Invite Splash\n"; // features+=`[Invite Splash](${msg.guild.inviteSplash()})\n`;

	if (features === "") features = "NONE";
	verificationLevel = [
		"**NONE** - unrestricted",
		"**LOW** - 	must have verified email on account",
		"**MEDIUM** - 	must be registered on Discord for longer than 5 minutes",
		"**HIGH** - (╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes",
		"**VERY HIGH** - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number"
	];
	//let s;
	//if (msg.channel.guild.memberCount < 1000) s = await Promise.all(msg.guild.members.filter(m => !m.user.bot).map((m) => mdb.collection("users").findOne({ id: m.id }))).then(res => res.map(m => m === null ? config.defaults.userConfig : m).map(m => ({ owoCount: m.owoCount === undefined ? 0 : m.owoCount, uwuCount: m.uwuCount === undefined ? 0 : m.uwuCount })));
	//else s = false;
	mfaLevel = [
		"NONE",
		"ELEVATED"
	];

	defaultNotifications = [
		"All Messages",
		"Only Mentions"
	];
	roles = msg.guild.roles.map(role => role.name === "@everyone" ? "@everyone" : `<@&${role.id}>`).join(",");
	rr = roles.length > 1000 ? `Too many to list, please use \`${msg.gConfig.prefix}roles server\`` : roles;
	embed = {
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
				value: `Total: ${msg.guild.memberCount}\n\n\
				<:online:590067324837691401>: ${msg.guild.members.filter(m => m.status === "online").length}\n\
				<:idle:590067351806803968>: ${msg.guild.members.filter(m => m.status === "idle").length}\n\
				<:dnd:590067389782032384>: ${msg.guild.members.filter(m => m.status === "dnd").length}\n\
				<:offline:590067411080970241>: ${msg.guild.members.filter(m => m.status === "offline").length}\n\n\
				Non Bots: ${msg.channel.guild.members.filter(m => !m.bot).length}\n\
				Bots: ${msg.channel.guild.members.filter(m => m.bot).length}`,
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
				value: `**Large Guild**: ${msg.guild.large ? "Yes" : "No"}\n**Verification**: ${verificationLevel[msg.guild.verificationLevel]}\n**2FA**: ${mfaLevel[msg.guild.mfaLevel]}\n**Default Notifications**: ${defaultNotifications[msg.guild.defaultNotifications]}\n**Features**:\n${features}`,
				inline: false
			}/*, {
				name: "Counters",
				value: !s ? "Guild is too large to display counts." : `OwO Counts: ${s.map(j => j.owoCount).reduce((a, b) => a + b)}\nUwU Counts: ${s.map(j => j.uwuCount).reduce((a, b) => a + b)}`,
				inline: false
			}*/
		]
	};

	Object.assign(embed, msg.embed_defaults());
	return msg.channel.createMessage({ embed });
}));