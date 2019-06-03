const {
	config,
	phin,
	fs,
	stringSimilarity,
	functions,
	Comic
} = require("../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"sources",
		"sc"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks", // 16834
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "List our comic sources",
	usage: "",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		

		const categoryIds = require("../../../conf/categoryIds");

		let embed = {
			title: "Sources List",
			description: `\`${Object.keys(categoryIds).join("`\n`")}\``
		};

		return message.channel.createMessage({ embed });
	})
};