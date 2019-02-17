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
	run: (async(message) => {
		message.channel.startTyping();
		let userCount, largeGuildCount, srv, data, embed;
		userCount = 0;
		message.client.guilds.forEach((guild) => {
			userCount+=guild.memberCount;
		});
		largeGuildCount = 0;
		srv = [...message.client.guilds.values()];
		for(let i=0;i<srv.length;i++) {
			if(!srv[i].unavailable) {
				if(srv[i].large) {
					largeGuildCount++;
				}
			} else {
				console.log(`Guild Unavailable: ${srv[i].name} (${srv[i].id})`);
			}
		}
		data = {
			"title": "Bot Info!",
			"fields": [
				{
					name: "Process Memory Usage",
					value: `${Math.round(message.client.memory.process.getUsed()/1024/1024)}MB/${Math.round(message.client.memory.process.getTotal()/1024/1024)}MB`,
					inline: false
				}, {
					name: "System Memory Usage",
					value: `${Math.round(message.client.memory.system.getUsed()/1024/1024/1024)}GB/${Math.round(message.client.memory.system.getTotal()/1024/1024/1024)}GB`,
					inline: false
				}, {
					name: "Library",
					value: message.client.config.bot.library,
					inline: false
				}, {
					name: "Uptime",
					value: `${message.client.parseTime(process.uptime())} (${message.client.secondsToHours(process.uptime())})`,
					inline: false
				}, {
					name: "Total Guilds",
					value: message.client.guilds.size,
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
					value: message.client.commandList.length,
					inline: false
				}, {
					name: "API Version",
					value: message.client.config.bot.apiVersion,
					inline: false
				}, {
					name: "Bot Version",
					value: message.client.config.bot.version,
					inline: false
				}, {
					name: "Discord.JS Version",
					value: message.client.Discord.version,
					inline: false
				}, {
					name: "Node.JS Version",
					value: process.version,
					inline: false
				}, {
					name: "Support Server",
					value: message.client.config.bot.supportInvite,
					inline: false
				}, {
					name: "Bot Creator",
					value: "Donovan_DMC#1337, [@Donovan_DMC](https://twitter.com/Donovan_DMC)",
					inline: false
				}, {
					name: "Trello Board",
					value: message.client.config.apis.trello.board,
					inline: false
				}
			]
		};
		Object.assign(data, message.embed_defaults());
		embed = new message.client.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};