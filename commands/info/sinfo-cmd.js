module.exports=(async (message, gConfig) => {
	if(!message) return new Error ("missing message parameter");
	if(!gConfig) return new Error ("missing gConfig parameter");
	await require(`../../BaseCommand.js`)(message, gConfig);
	var textChCount = 0;
	var voiceChCount = 0;
	var roleCount = 0;
	var categoryChCount = 0;
	message.channel.guild.channels.forEach((ch) => {
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
	
	var o = message.guild.members.find(m=>m.id===message.guild.ownerID);
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
		title: `Server Info - **${message.guild.name}**`,
		image: {
			url: message.guild.iconURL
		},
		thumbnail: {
			url: config.botIconURL
		},
		fields: [
			{
				name: "Guild ID",
				value: message.guild.id,
				inline: true
			},
			{
				name: "Guild Owner",
				value: owner,
				inline: true
			},
			{
				name: "Members",
				value: `Total: ${message.guild.memberCount}\n\n${config.emojis.online}: ${message.guild.members.filter(m=>m.user.presence.status==="online").size}\n${config.emojis.idle}: ${message.guild.members.filter(m=>m.user.presence.status==="idle").size}\n${config.emojis.offline}: ${message.guild.members.filter(m=>m.user.presence.status==="offline").size}\n${config.emojis.dnd}: ${message.guild.members.filter(m=>m.user.presence.status==="dnd").size}`,
				inline: true
			},
			{
				name: "Channels",
				value: `Total: ${message.guild.channels.size}\n\Text: ${textChCount}\nVoice: ${voiceChCount}\nCategory: ${categoryChCount}`,
				inline: true
			},
			{
				name: "Large Guild (300+ Members)",
				value: message.guild.large,
				inline: true
			},
			{
				name: "Guild Creation Date",
				value: message.guild.createdAt.toString().split("GMT")[0],
				inline: true
			},
			{
				name: "Region",
				value: message.guild.region,
				inline: true
			},
			{
				name: "Default Notification Level",
				value: message.guild.defaultMessageNotifications,
				inline: true
			},
			{
				name: `Roles [${message.guild.roles.size-1}]`,
				value: `run **${gConfig.prefix}roles** for a list of roles`,
				inline: true
			},
			{
				name: "Extra",
				value: `Verified: ${message.guild.verified}\nVIP Regions: ${vipRegion}\nVanity URL: ${vanityURL}\nInvite Splash: ${inviteSplash}`,
				inline: true
			},
			{
				name: "Verification/2FA Levels",
				value: `Verification: ${verificationLevel[message.guild.verificationLevel]}\n2FA: ${mfaLevel[message.guild.mfaLevel]}`,
				inline: true
			},
			{
			 name: "Vote for this bot!",
			 value: config.vote,
			 inline: true
			}
		]
	};
	
	Object.assign(data, embed_defaults);
	
	var embed = new Discord.MessageEmbed(data);
	message.channel.send(embed);
});