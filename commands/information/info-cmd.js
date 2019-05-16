module.exports = {
	triggers: [
		"info",
		"inf"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 2e3,
	description: "Get some info about the bot",
	usage: "",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let userCount, largeGuildCount, srv, embed;
		embed = {
			title: "Bot Info!",
			fields: [
				{
					name: "Process Memory Usage",
					value: `${Math.round(this.memory.process.getUsed()/1024/1024)}MB/${Math.round(this.memory.process.getTotal()/1024/1024)}MB`,
					inline: false
				}, {
					name: "System Memory Usage",
					value: `${Math.round(this.memory.system.getUsed()/1024/1024/1024)}GB/${Math.round(this.memory.system.getTotal()/1024/1024/1024)}GB`,
					inline: false
				}, {
					name: "Library",
					value: this.config.bot.library,
					inline: false
				}, {
					name: "Uptime",
					value: `${this.parseTime(process.uptime())} (${this.secondsToHours(process.uptime())})`,
					inline: false
				}, {
					name: "Total Guilds",
					value: this.bot.guilds.size,
					inline: false
				}, {
					name: "Large Guilds (300+ Members)",
					value: this.bot.guilds.filter(g => g.large).length,
					inline: false
				}, {
					name: "Total Users",
					value: this.bot.guilds.map(g => g.memberCount).reduce((a,b) => a + b),
					inline: false
				}, {
					name: "Commands",
					value: this.commandList.length,
					inline: false
				}, {
					name: "API Version",
					value: this.config.bot.apiVersion,
					inline: false
				}, {
					name: "Bot Version",
					value: this.config.bot.version,
					inline: false
				}, {
					name: `${this.config.bot.library}`,
					value: this.config.bot.libraryVersion,
					inline: false
				}, {
					name: "Node.JS Version",
					value: process.version,
					inline: false
				}, {
					name: "Support Server",
					value: this.config.bot.supportInvite,
					inline: false
				}, {
					name: "Bot Creator",
					value: "Donovan_DMC#3621, [@Donovan_DMC](https://twitter.com/Donovan_DMC)",
					inline: false
				}, {
					name: "Trello Board",
					value: this.config.apis.trello.board,
					inline: false
				}
			]
		};
		Object.assign(embed, message.embed_defaults());
		message.channel.createMessage({ embed });
	})
};