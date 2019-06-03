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
		"whosagoodboy",
		"whosagoodboi",
		"goodboi"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Who's a good boy?!",
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
		return message.channel.createMessage(`<@!${message.author.id}>, Yip! Yip! I am! I am! :fox:`);
	})
};