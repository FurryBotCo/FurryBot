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
		"flop"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Flop onto someone! OwO",
	usage: "<@member/string>",
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
		let input, text;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		
		input = message.args.join(" ");
		text = this.varParse(message.c,{author:message.author,input});
		message.channel.createMessage(text);
	})
};