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
		"8ball"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Ask the magic 8ball a question!",
	usage: "<question>",
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
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let responses = [
				"It is certain",
				"Without a doubt",
				"Most likely",
				"Yes",
				"Reply was hazy, try again later",
				"Ask again later",
				"My answer is no",
				"No",
				"Very doubtful"
			],
			response = responses[Math.floor(Math.random() * responses.length)];
		return message.channel.createMessage(`<@!${message.author.id}>, The Magic 8ball said **${response}**.`);
	})
};