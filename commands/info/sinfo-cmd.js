module.exports = {
	triggers: ["sinfo","serverinfo"],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get some info about the current server",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: ()=>{}
};

module.exports = (async (self,local) => {
	local.channel.startTyping();
	var textChCount = 0,
	voiceChCount = 0,
	categoryChCount = 0;
	if(!isNaN(local.args[0]) && self.user.isDeveloper) {
		var guild = local.guilds.get(local.args[0]);
		if(!guild) {
			var data = {
				title: "Guild Not Found"
			}
			Object.assign(data,local.embed_defaults());
			var embed = new self.Discord.MessageEmbed(data);
			return local.channel.send(embed);
		}
	} else {
		var guild = local.guild;
	}
	var guildConfig = await self.db.getGuild(guild.id);
	guild.channels.forEach((ch) => {
		switch (ch.type) {
			case "text":
				textChCount++;
				break;

			case "voice":
				voiceChCount++;
				break;
				
			case "category":
				categoryChCount++;
				break;
		}
	});
	
	var o = guild.members.find(m=>m.id===guild.owner.id);
	if(!o) {
		var owner="Unknown";
	} else {
		owner = `${o.user.tag} (${o.id})`;
	}
	
	var features = "";
if(guild.verified) features+="Verified\n";
	if(guild.features.indexOf("VIP_REGIONS") !== -1) features+="VIP Voice Vegions\n";
	// if fetching vanity url fails return discord-api
	if(guild.features.indexOf("VANITY_URL") !== -1) features+=`Vanity URL: https://discord.gg/${guild.fetchVanityCode().catch(noerr=>"discord-api")}\n`;
	if(guild.features.indexOf("INVITE_SPLASH") !== -1) features+=`[Invite Splash](${guild.inviteSplash()})\n`;

	if(features === "") features = "NONE";
	var verificationLevel = [
		"**NONE** - unrestricted",
		"**LOW** - 	must have verified email on account",
		"**MEDIUM** - 	must be registered on Discord for longer than 5 minutes",
		"**HIGH** - (╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes",
		"**VERY HIGH** - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number"
	];

	var mfaLevel = [
		"NONE",
		"ELEVATED"
	];
	var roles = guild.roles.map(role=>{if(role.name!=="@everyone"){return `<@&${role.id}> `}else{return "@everyone "}}).toString();
	var rr = roles.length > 1000 ? `Too many to list, please use \`${local.gConfig.prefix}roles server\`` : roles;
	var data = {
		title: `Server Info - **${guild.name}**`,
		image: {
			url: guild.iconURL()
		},
		fields: [
			{
				name: "Guild ID",
				value: guild.id,
				inline: false
			},
			{
				name: "Guild Owner",
				value: owner,
				inline: false
			},
			{
				name: "Members",
				value: `Total: ${guild.memberCount}\n\n${self.config.emojis.online}: ${guild.members.filter(m=>m.user.presence.status==="online").size}\n${self.config.emojis.idle}: ${guild.members.filter(m=>m.user.presence.status==="idle").size}\n${self.config.emojis.dnd}: ${guild.members.filter(m=>m.user.presence.status==="dnd").size}\n${self.config.emojis.offline}: ${guild.members.filter(m=>m.user.presence.status==="offline").size}`,
				inline: false
			},
			{
				name: "Channels",
				value: `Total: ${guild.channels.size}\nText: ${textChCount}\nVoice: ${voiceChCount}\nCategory: ${categoryChCount}`,
				inline: false
			},
			{
				name: "Guild Creation Date",
				value: guild.createdAt.toString().split("GMT")[0],
				inline: false
			},
			{
				name: "Region",
				value: self.ucwords(guild.region),
				inline: false
			},
			{
				name: `Roles [${guild.roles.size-1}]`,
				value: rr,
				inline: false
			},
			{
				name: "Extra",
				value: `**Large Guild**: ${self.ucwords(guild.large)}\n**Verification**: ${verificationLevel[guild.verificationLevel]}\n**2FA**: ${mfaLevel[guild.mfaLevel]}\n**Default Notifications**: ${guild.defaultMessageNotifications}\n**Features**:\n${features}`,
				inline: false
			}
		]
	};
	
	Object.assign(data, local.embed_defaults());
	
	var embed = new self.Discord.MessageEmbed(data);
	local.channel.send(embed);
	return local.channel.stopTyping();
});