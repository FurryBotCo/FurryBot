module.exports = {
	triggers: [
		"info",
		"inf"
	],
	userPermissions: [],
	botPermissions: [
		"EMBED_LINKS"
	],
	cooldown: 2e3,
	description: "Get some info about the bot",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (self,local) => {
		local.channel.startTyping();
		var userCount=0;
		self.guilds.forEach((guild) => {
			userCount+=guild.memberCount;
		});
		var largeGuildCount=0;
		var srv=Array.from(self.guilds.values());
		for(let i=0;i<srv.length;i++) {
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
			"fields": [
				{
					name: "Process Memory Usage",
					value: `${self.getUsedMemoryMB()}MB/${self.getTotalMemoryMB()}MB`,
					inline: false
				}, {
					name: "Server Memory Usage",
					value: `${self.getSYSUsedGB()}GB/${self.getSYSTotalGB()}GB`,
					inline: false
				}, {
					name: "Library",
					value: self.config.bot.library,
					inline: false
				}, {
					name: "Uptime",
					value: `${self.parseTime(process.uptime())} (${self.secondsToHours(process.uptime())})`,
					inline: false
				}, {
					name: "Total Guilds",
					value: self.guilds.size,
					inline: false
				}, {
					name: "Large Guilds (300+ Members)",
					value: largeGuildCount,
					inline: false
				}, {
					name: "Total Users",
					value: userCount,
					inline: false
				}, {
					name: "Commands",
					value: self.config.commandList.all.length,
					inline: false
				}, {
					name: "API Version",
					value: self.config.bot.apiVersion,
					inline: false
				}, {
					name: "Bot Version",
					value: self.config.bot.version,
					inline: false
				}, {
					name: "Discord.JS Version",
					value: self.Discord.version,
					inline: false
				}, {
					name: "Node.JS Version",
					value: process.version,
					inline: false
				}, {
					name: "Support Server",
					value: self.config.bot.supportInvite,
					inline: false
				}, {
					name: "Bot Creator",
					value: "Donovan_DMC#1337, [@Donovan_DMC](https://twitter.com/Donovan_DMC)",
					inline: false
				}, {
					name: "Trello Board",
					value: self.config.apis.trello.board,
					inline: false
				}
				]
			};
		Object.assign(data, local.embed_defaults());
		var embed = new self.Discord.MessageEmbed(data);
		local.channel.send(embed);
		return local.channel.stopTyping();
	})
};