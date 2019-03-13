module.exports = {
	triggers: [
		"sinfo",
		"serverinfo",
		"server",
		"si"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get some info about the current server",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		message.channel.startTyping();
		let textChCount, voiceChCount, categoryChCount, guild, data, embed, guildConfig, o, owner, features, mfaLevel, verificationLevel, roles, rr;
		textChCount = 0,
		voiceChCount = 0,
		categoryChCount = 0;
		if(!isNaN(message.args[0]) && this.user.isDeveloper) {
			guild = this.guilds.get(message.args[0]);
			if(!guild) {
				data = {
					title: "Guild Not Found"
				};
				Object.assign(data,message.embed_defaults());
				embed = new this.Discord.MessageEmbed(data);
				return message.channel.send(embed);
			}
		} else {
			guild = message.guild;
		}
		guildConfig = await this.db.getGuild(guild.id);
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
		
		o = guild.members.find(m => m.id === guild.owner.id);
		if(!o) {
			owner="Unknown";
		} else {
			owner = `${o.user.tag} (${o.id})`;
		}
		
		features = "";
		if(guild.verified) features+="Verified\n";
		if(guild.features.indexOf("VIP_REGIONS") !== -1) features+="VIP Voice Vegions\n";
		// if fetching vanity url fails return discord-api
		if(guild.features.indexOf("VANITY_URL") !== -1) features+=`Vanity URL: https://discord.gg/${guild.fetchVanityCode().catch(noerr => "discord-api")}\n`;
		if(guild.features.indexOf("INVITE_SPLASH") !== -1) features+=`[Invite Splash](${guild.inviteSplash()})\n`;
	
		if(features === "") features = "NONE";
		verificationLevel = [
			"**NONE** - unrestricted",
			"**LOW** - 	must have verified email on account",
			"**MEDIUM** - 	must be registered on Discord for longer than 5 minutes",
			"**HIGH** - (╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes",
			"**VERY HIGH** - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number"
		];
	
		mfaLevel = [
			"NONE",
			"ELEVATED"
		];
		roles = guild.roles.map(role => role.name==="@everyone"?"@everyone":`<@&${role.id}>`).toString();
		rr = roles.length > 1000 ? `Too many to list, please use \`${message.gConfig.prefix}roles server\`` : roles;
		data = {
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
					value: `Total: ${guild.memberCount}\n\n${this.config.emojis.online}: ${guild.members.filter(m => m.user.presence.status==="online").size}\n${this.config.emojis.idle}: ${guild.members.filter(m => m.user.presence.status==="idle").size}\n${this.config.emojis.dnd}: ${guild.members.filter(m => m.user.presence.status==="dnd").size}\n${this.config.emojis.offline}: ${guild.members.filter(m => m.user.presence.status==="offline").size}\n\nNon Bots: ${message.guild.memberCount - message.guild.members.filter(m => !m.user.bot).size}\nBots: ${message.guild.members.filter(m => m.user.bot).size}`,
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
					value: this.ucwords(guild.region),
					inline: false
				},
				{
					name: `Roles [${guild.roles.size-1}]`,
					value: rr,
					inline: false
				},
				{
					name: "Extra",
					value: `**Large Guild**: ${guild.large?"Yes":"No"}\n**Verification**: ${verificationLevel[guild.verificationLevel]}\n**2FA**: ${mfaLevel[guild.mfaLevel]}\n**Default Notifications**: ${guild.defaultMessageNotifications}\n**Features**:\n${features}`,
					inline: false
				}
			]
		};
		
		Object.assign(data, message.embed_defaults());
		
		embed = new this.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};