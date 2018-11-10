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
	
	var vipRegion = message.guild.features.indexOf("VIP_REGIONS") !== -1;
	var vanityURL = message.guild.features.indexOf("VANITY_URL") !== -1;
	var inviteSplash = message.guild.features.indexOf("INVITE_SPLASH") !== -1;

	var verificationLevel = [
		"**NONE** - unrestricted",
		"**LOW** - 	must have verified email on account",
		"**MEDIUM** - 	must be registered on Discord for longer than 5 minutes",
		"**HIGH** - (╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes",
		"**VERY HIGH** - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number"
	];

	var mfaLevel = [
		"**NONE**",
		"**ELEVATED**"
	];

	var data = {
		title: `Server Info - **${self.guild.name}**`,
		image: {
			url: message.guild.iconURL()
		},
		fields: [
			{
				name: "Guild ID",
				value: self.guild.id,
				inline: true
			},
			{
				name: "Guild Owner",
				value: owner,
				inline: true
			},
			{
				name: "Members",
				value: `Total: ${self.guild.memberCount}\n\n${self.config.emojis.online}: ${self.guild.members.filter(m=>m.user.presence.status==="online").size}\n${self.config.emojis.idle}: ${message.guild.members.filter(m=>m.user.presence.status==="idle").size}\n${self.config.emojis.offline}: ${self.guild.members.filter(m=>m.user.presence.status==="offline").size}\n${self.emojis.dnd}: ${self.guild.members.filter(m=>m.user.presence.status==="dnd").size}`,
				inline: true
			},
			{
				name: "Channels",
				value: `Total: ${self.guild.channels.size}\n\hText: ${textChCount}\nVoice: ${voiceChCount}\nCategory: ${categoryChCount}`,
				inline: true
			},
			{
				name: "Large Guild (300+ Members)",
				value: self.guild.large,
				inline: true
			},
			{
				name: "Guild Creation Date",
				value: self.guild.createdAt.toString().split("GMT")[0],
				inline: true
			},
			{
				name: "Region",
				value: self.guild.region,
				inline: true
			},
			{
				name: "Default Notification Level",
				value: self.guild.defaultMessageNotifications,
				inline: true
			},
			{
				name: `Roles [${self.guild.roles.size-1}]`,
				value: `run **${gConfig.prefix}roles** for a list of roles`,
				inline: true
			},
			{
				name: "Extra",
				value: `Verified: ${self.guild.verified}\nVIP Regions: ${vipRegion}\nVanity URL: ${vanityURL}\nInvite Splash: ${inviteSplash}`,
				inline: true
			},
			{
				name: "Verification/2FA Levels",
				value: `Verification: ${verificationLevel[self.guild.verificationLevel]}\n2FA: ${mfaLevel[self.guild.mfaLevel]}`,
				inline: true
			},
			{
			 name: "Vote for this bot!",
			 value: self.config.vote,
			 inline: true
			}
		]
	};
	
	Object.assign(data, self.embed_defaults);
	
	var embed = new self.Discord.MessageEmbed(data);
	self.channel.send(embed);
});