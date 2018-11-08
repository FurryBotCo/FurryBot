module.exports=(async (message, gConfig) => {
	if(!message) return new Error ("missing message parameter");
	if(!gConfig) return new Error ("missing gConfig parameter");
	await require(`../../BaseCommand.js`)(message, gConfig);
	var userCount=0;
	client.guilds.forEach((guild) => {
		userCount+=guild.memberCount;
	});
	var largeGuildCount=0;
	var srv=Array.from(client.guilds.values());
	for(i=0;i<srv.length;i++) {
		if(!srv[i].unavailable) {
			if(srv[i].large) {
				largeGuildCount++;
			}
		} else {
			console.log(`Guild Unavailable: ${srv[i].name} (${srv[i].id})`);
		}
	}
	var data = {
		"title": "Bot Info!",
		"image": {
			"url": message.channel.guild.iconURL
		},
		"fields": [
			{
				name: "Process Memory Usage",
				value: `${custom.getUsedMemory()}/${custom.getTotalMemory()}`,
				inline: true
			}, {
				name: "Server Memory Usage",
				value: `${custom.getSYSUsedGB()}GB/${custom.getSYSTotalGB()}GB`,
				inline: true
			}, {
				name: "Library",
				value: config.bot.library,
				inline: true
			}, {
				name: "Uptime",
				value: `${custom.parseTime(process.uptime())} (${custom.secondsToHours(process.uptime())})`,
				inline: true
			}, {
				name: "Total Guilds",
				value: client.guilds.size,
				inline: true
			}, {
				name: "Large Guilds (300+)",
				value: largeGuildCount,
				inline: true
			}, {
				name: "Total Users",
				value: userCount,
				inline: true
			}, {
				name: "Commands",
				value: config.commandList.all.length,
				inline: true
			}, {
				name: "API Version",
				value: config.bot.apiVersion,
				inline: true
			}, {
				name: "Bot Version",
				value: config.bot.version,
				inline: true
			}, {
				name: "Discord.JS Version",
				value: Discord.version,
				inline: true
			}, {
				name: "Node.JS Version",
				value: process.version,
				inline: true
			}, {
				name: "Support Server",
				value: config.discordSupportInvite,
				inline: false
			}, {
				name: "Bot Creator",
				value: "Donovan_DMC#1337, [@Donovan_DMC](https://twitter.com/Donovan_DMC)",
				inline: false
			}, {
				name: "Trello Board",
				value: config.trello.board,
				inline: false
			},
			  {
			   name: "Vote for this bot",
			   value: config.vote,
			   inline: false
			  }
			]
		};
	Object.assign(data, embed_defaults);
	var embed = new Discord.MessageEmbed(data);
	return message.channel.send(embed);
});