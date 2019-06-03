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
		"roleyear"
	],
	userPermissions: [
		"manageRoles" // 268435456
	],
	botPermissions: [
		"manageRoles" // 268435456
	],
	cooldown: 2e3,
	description: "Assign roles based on join year.",
	usage: "<year> <role>",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		return message.reply("Temporarily disabled");
		
		/* eslint-disable no-unreachable */
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let data, embed;
		if(message.args.length < 2) return new Error("ERR_INVALID_USAGE");
		const year = parseInt(message.args[0],10),
			role = await message.getRoleFromArgs(1);
		if(isNaN(year)) return message.channel.createMessage("Invalid year!");
		if(!role) return message.errorEmbed("INVALID_ROLE");

		/* eslint-enable no-unreachable */
	})
};