const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"name"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Change the bots username",
	usage: "<username>",
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
		// extra check, to be safe
		if (!config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer of this bot.`);
		if(message.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
		let set;
		set = message.unparsedArgs.join(" ");
		if(set.length < 2 || set.length > 32) return message.channel.createMessage("Username must be between **2** and **32** characters.");
		this.bot.editSelf({username: set})
			.then((user) => message.channel.createMessage(`<@!${message.author.id}>, Set username to: ${user.username}`))
			.catch((err) => message.channel.createMessage(`There was an error while doing this: ${err}`));
	})
};