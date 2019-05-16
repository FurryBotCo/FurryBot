module.exports = {
	triggers: [
		"leaveserver"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Make the bot leave a server (dev only)",
	usage: "[server id]",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		// extra check, to be safe
		if (!this.config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer of this bot.`);
		if(message.unparsedArgs.length === 0) {
			return new Error("ERR_INVALID_USAGE");
		}
		if(!this.guilds.has(message.unparsedArgs[0])) {
			return message.channel.createMessage(`<@!${message.author.id}>, Guild not found`);
		}
		this.guilds.get(message.unparsedArgs[0]).leave().then((guild) => {
			return message.channel.createMessage(`<@!${message.author.id}>, Left guild **${guild.name}** (${guild.id})`);
		}).catch((err) => {
			return message.channel.createMessage(`There was an error while doing this: ${err}`) ;
		});
	})
};