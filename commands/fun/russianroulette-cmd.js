module.exports = {
	triggers: [
		"russianroulette",
		"roulette",
		"rr"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Play russian roulette",
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
		let val, bullets;
		val = Math.floor(Math.random()*6);
		bullets = typeof message.args[0] !== "undefined" ? parseInt(message.args[0],10) : 3;
		
		if(val<=bullets-1) return message.channel.createMessage(`<@!${message.author.id}>, You died!`);
		return message.channel.createMessage(`<@!${message.author.id}>, You lived!`);
	})
};