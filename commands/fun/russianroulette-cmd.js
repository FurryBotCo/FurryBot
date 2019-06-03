const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

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
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let val, bullets;
		val = Math.floor(Math.random()*6);
		bullets = typeof message.args[0] !== "undefined" ? parseInt(message.args[0],10) : 3;
		
		if(val<=bullets-1) return message.channel.createMessage(`<@!${message.author.id}>, You died!`);
		return message.channel.createMessage(`<@!${message.author.id}>, You lived!`);
	})
};