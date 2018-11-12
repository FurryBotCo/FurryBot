module.exports = (async (self,local) => {
	Object.assign(self,local);
	var userCount=0;
	self.guilds.forEach((guild) => {
		userCount+=guild.memberCount;
	});
	var largeGuildCount=0;
	var srv=Array.from(self.guilds.values());
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
			"url": self.channel.guild.iconURL()
		},
		"fields": [
			{
				name: "Process Memory Usage",
				value: `${self.getUsedMemory()}/${self.getTotalMemory()}`,
				inline: true
			}, {
				name: "Server Memory Usage",
				value: `${self.getSYSUsedGB()}GB/${self.getSYSTotalGB()}GB`,
				inline: true
			}, {
				name: "Library",
				value: self.config.bot.library,
				inline: true
			}, {
				name: "Uptime",
				value: `${self.parseTime(process.uptime())} (${self.secondsToHours(process.uptime())})`,
				inline: true
			}, {
				name: "Total Guilds",
				value: self.guilds.size,
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
				value: self.config.commandList.all.length,
				inline: true
			}, {
				name: "API Version",
				value: self.config.bot.apiVersion,
				inline: true
			}, {
				name: "Bot Version",
				value: self.config.bot.version,
				inline: true
			}, {
				name: "Discord.JS Version",
				value: self.Discord.version,
				inline: true
			}, {
				name: "Node.JS Version",
				value: process.version,
				inline: true
			}, {
				name: "Support Server",
				value: self.config.discordSupportInvite,
				inline: false
			}, {
				name: "Bot Creator",
				value: "Donovan_DMC#1337, [@Donovan_DMC](https://twitter.com/Donovan_DMC)",
				inline: false
			}, {
				name: "Trello Board",
				value: self.config.trello.board,
				inline: false
			},
			  {
			   name: "Vote for this bot",
			   value: self.config.vote,
			   inline: false
			  }
			]
		};
	Object.assign(data, self.embed_defaults);
	var embed = new self.Discord.MessageEmbed(data);
	return self.channel.send(embed);
});