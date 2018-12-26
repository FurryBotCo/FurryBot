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
	run: (async (client,message) => {
		message.channel.startTyping();
		var userCount=0;
		client.guilds.forEach((guild) => {
			userCount+=guild.memberCount;
		});
		var largeGuildCount=0;
		var srv=Array.from(client.guilds.values());
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
					value: `${client.getUsedMemoryMB()}MB/${client.getTotalMemoryMB()}MB`,
					inline: false
				}, {
					name: "Server Memory Usage",
					value: `${client.getSYSUsedGB()}GB/${client.getSYSTotalGB()}GB`,
					inline: false
				}, {
					name: "Library",
					value: client.config.bot.library,
					inline: false
				}, {
					name: "Uptime",
					value: `${client.parseTime(process.uptime())} (${client.secondsToHours(process.uptime())})`,
					inline: false
				}, {
					name: "Total Guilds",
					value: client.guilds.size,
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
					value: client.config.commandList.all.length,
					inline: false
				}, {
					name: "API Version",
					value: client.config.bot.apiVersion,
					inline: false
				}, {
					name: "Bot Version",
					value: client.config.bot.version,
					inline: false
				}, {
					name: "Discord.JS Version",
					value: client.Discord.version,
					inline: false
				}, {
					name: "Node.JS Version",
					value: process.version,
					inline: false
				}, {
					name: "Support Server",
					value: client.config.bot.supportInvite,
					inline: false
				}, {
					name: "Bot Creator",
					value: "Donovan_DMC#1337, [@Donovan_DMC](https://twitter.com/Donovan_DMC)",
					inline: false
				}, {
					name: "Trello Board",
					value: client.config.apis.trello.board,
					inline: false
				}
				]
			};
		Object.assign(data, message.embed_defaults());
		var embed = new client.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};