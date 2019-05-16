module.exports = {
	triggers: [
		"roll"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Roll the dice",
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
		let min, max;
		min = typeof message.args[0] !== "undefined" ? parseInt(message.args[0],10) : 1;
		max = typeof message.args[1] !== "undefined" ? parseInt(message.args[1],10) : 20;
	
		return message.channel.createMessage(`<@!${message.author.id}>, you rolled a ${this._.random(min,max)}!`);
	})
};