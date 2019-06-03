const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

module.exports = {
	triggers: [
		"sinfo",
		"serverinfo",
		"server",
		"si"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 2e3,
	description: "Get some info about the current server",
	usage: "",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let textChCount = message.guild.channels.filter(c => c.type === 0).length,
			voiceChCount = message.guild.channels.filter(c => c.type === 2).length,
			categoryChCount = message.guild.channels.filter(c => c.type === 4).length,
			embed, o, owner, features, mfaLevel, verificationLevel, defaultNotifications, roles, rr;

		o = message.guild.members.find(m => m.id === message.guild.ownerID);
		if(!o) {
			owner = "Unknown";
		} else {
			owner = `${o.user.username}#${o.user.discriminator} (${o.id})`;
		}
		features = "";
		if(message.channel.guild.verified) features+="Verified\n";
		if(message.channel.guild.features.indexOf("VIP_REGIONS") !== -1) features+="VIP Voice Vegions\n";
		// if fetching vanity url fails return discord-api
		if(message.channel.guild.features.indexOf("VANITY_URL") !== -1) features += "Vanity URL\n"; // features+=`Vanity URL: https://discord.gg/${message.guild.fetchVanityCode().catch(noerr => "discord-api")}\n`;
		if(message.channel.guild.features.indexOf("INVITE_SPLASH") !== -1) features += "Invite Splash\n"; // features+=`[Invite Splash](${message.guild.inviteSplash()})\n`;
	
		if(features === "") features = "NONE";
		verificationLevel = [
			"**NONE** - unrestricted",
			"**LOW** - 	must have verified email on account",
			"**MEDIUM** - 	must be registered on Discord for longer than 5 minutes",
			"**HIGH** - (╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes",
			"**VERY HIGH** - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number"
		];
		let s;
		if(message.channel.guild.memberCount < 1000) s = await Promise.all(message.guild.members.filter(m => !m.user.bot).map((m) => mdb.collection("users").findOne({id: m.id}))).then(res => res.map(m => m === null ? config.default.userConfig : m).map(m => ({owoCount: m.owoCount === undefined ? 0 : m.owoCount,uwuCount: m.uwuCount === undefined ? 0 : m.uwuCount})));
		else s = false;
		mfaLevel = [
			"NONE",
			"ELEVATED"
		];

		defaultNotifications = [
			"All Messages",
			"Only Mentions"
		];
		roles = message.guild.roles.map(role => role.name === "@everyone" ? "@everyone" : `<@&${role.id}>`).join(",");
		rr = roles.length > 1000 ? `Too many to list, please use \`${message.gConfig.prefix}roles server\`` : roles;
		embed = {
			title: `Server Info - **${message.guild.name}**`,
			image: {
				url: message.guild.iconURL
			},
			fields: [
				{
					name: "Guild ID",
					value: message.channel.guild.id,
					inline: false
				},
				{
					name: "Guild Owner",
					value: owner,
					inline: false
				},
				{
					name: "Members",
					value: `Total: ${message.guild.memberCount}\n\n\
					${config.emojis.online}: ${message.guild.members.filter(m => m.status === "online").length}\n\
					${config.emojis.idle}: ${message.guild.members.filter(m => m.status === "idle").length}\n\
					${config.emojis.dnd}: ${message.guild.members.filter(m => m.status === "dnd").length}\n\
					${config.emojis.offline}: ${message.guild.members.filter(m => m.status === "offline").length}\n\n\
					Non Bots: ${message.channel.guild.members.filter(m => !m.bot).length}\n\
					Bots: ${message.channel.guild.members.filter(m => m.bot).length}`,
					inline: false
				},
				{
					name: "Channels",
					value: `Total: ${message.guild.channels.size}\n\
					Text: ${textChCount}\n\
					Voice: ${voiceChCount}\n\
					Category: ${categoryChCount}`,
					inline: false
				},
				{
					name: "Guild Creation Date",
					value: new Date(message.guild.createdAt).toString().split("GMT")[0],
					inline: false
				},
				{
					name: "Region",
					value: message.guild.region,
					inline: false
				},
				{
					name: `Roles [${message.guild.roles.size-1}]`,
					value: rr,
					inline: false
				},
				{
					name: "Extra",
					value: `**Large Guild**: ${message.guild.large?"Yes":"No"}\n**Verification**: ${verificationLevel[message.guild.verificationLevel]}\n**2FA**: ${mfaLevel[message.guild.mfaLevel]}\n**Default Notifications**: ${defaultNotifications[message.guild.defaultNotifications]}\n**Features**:\n${features}`,
					inline: false
				},{
					name: "Counters",
					value: !s ? "Guild is too large to display counts." : `OwO Counts: ${s.map(j => j.owoCount).reduce((a,b) => a + b)}\nUwU Counts: ${s.map(j => j.uwuCount).reduce((a,b) => a + b)}`,
					inline: false
				}
			]
		};

		Object.assign(embed, message.embed_defaults());
		return message.channel.createMessage({ embed });
	})
};