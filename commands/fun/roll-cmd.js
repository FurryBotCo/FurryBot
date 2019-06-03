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
		"roll"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Roll the dice",
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
		let min, max;
		min = typeof message.args[0] !== "undefined" ? parseInt(message.args[0],10) : 1;
		max = typeof message.args[1] !== "undefined" ? parseInt(message.args[1],10) : 20;
	
		return message.channel.createMessage(`<@!${message.author.id}>, you rolled a ${this._.random(min,max)}!`);
	})
};