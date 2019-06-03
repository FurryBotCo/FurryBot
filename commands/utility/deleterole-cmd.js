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
		"deleterole",
		"dr"
	],
	userPermissions: [
		"manageRoles" // 268435456
	],
	botPermissions: [
		"manageRoles" // 268435456
	],
	cooldown: 1e3,
	description: "Delete a role",
	usage: "<name>",
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
		const role = message.getRoleFromArgs(0,false,true);
		if(!role) return message.errorEmbed("INVALID_ROLE");
		await role.delete(`Command: ${message.author.username}#${message.author.discriminator} (${message.author.id})`).then(() => {
			return message.channel.createMessage(`<@!${message.author.id}>, deleted role **${role.name}**`);
		});
	})
};