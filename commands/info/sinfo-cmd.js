module.exports = (async (self,local) => {
	Object.assign(self,local);
	var textChCount = 0;
	var voiceChCount = 0;
	var roleCount = 0;
	var categoryChCount = 0;
	self.guild.channels.forEach((ch) => {
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
	
	var o = self.guild.members.find(m=>m.id===self.guild.owner.id);
	if(!o) {
		var owner="Unknown";
	} else {
		owner = `${o.user.tag} (${o.id})`;
	}
	
	var features = "";
if(self.guild.verified) features+="Verified\n";
	if(self.guild.features.indexOf("VIP_REGIONS") !== -1) features+="VIP Voice Vegions\n";
	// if fetching vanity url fails return discord-api
	if(self.guild.features.indexOf("VANITY_URL") !== -1) features+=`Vanity URL: https://discord.gg/${self.guild.fetchVanityCode().catch(noerr=>"discord-api")}\n`;
	if(self.guild.features.indexOf("INVITE_SPLASH") !== -1) features+=`[Invite Splash](${self.guild.inviteSplash()})\n`;

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

	var data = {
		title: `Server Info - **${self.guild.name}**`,
		image: {
			url: self.guild.iconURL()
		},
		fields: [
			{
				name: "Guild ID",
				value: self.guild.id,
				inline: false
			},
			{
				name: "Guild Owner",
				value: owner,
				inline: false
			},
			{
				name: "Members",
				value: `Total: ${self.guild.memberCount}\n\n${self.config.emojis.online}: ${self.guild.members.filter(m=>m.user.presence.status==="online").size}\n${self.config.emojis.idle}: ${self.message.guild.members.filter(m=>m.user.presence.status==="idle").size}\n${self.config.emojis.dnd}: ${self.guild.members.filter(m=>m.user.presence.status==="dnd").size}\n${self.config.emojis.offline}: ${self.guild.members.filter(m=>m.user.presence.status==="offline").size}`,
				inline: false
			},
			{
				name: "Channels",
				value: `Total: ${self.guild.channels.size}\nText: ${textChCount}\nVoice: ${voiceChCount}\nCategory: ${categoryChCount}`,
				inline: false
			},
			{
				name: "Guild Creation Date",
				value: self.guild.createdAt.toString().split("GMT")[0],
				inline: false
			},
			{
				name: "Region",
				value: self.ucwords(self.guild.region),
				inline: false
			},
			{
				name: `Roles [${self.guild.roles.size-1}]`,
				value: `run **${self.gConfig.prefix}roles** for a list of roles`,
				inline: false
			},
			{
				name: "Extra",
				value: `**Large Guild**: ${self.ucwords(self.guild.large)}\n**Verification**: ${verificationLevel[self.guild.verificationLevel]}\n**2FA**: ${mfaLevel[self.guild.mfaLevel]}\n**Default Notifications**: ${self.guild.defaultMessageNotifications}\n**Features**:\n${features}`,
				inline: false
			}
		]
	};
	
	Object.assign(data, self.embed_defaults);
	
	var embed = new self.Discord.MessageEmbed(data);
	self.channel.send(embed);
});