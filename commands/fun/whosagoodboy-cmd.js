module.exports = {
	triggers: [
		"whosagoodboy",
		"whosagoodboi",
		"goodboi"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Who's a good boy?!",
	usage: "",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		return message.channel.createMessage(`<@!${message.author.id}>, Yip! Yip! I am! I am! :fox:`);
	})
};