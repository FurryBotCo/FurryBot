const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"edit"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Edit stuff about the bot",
	usage: "<icon/name/game>",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		else return this.sendCommandEmbed(message,message.command);
	})
};