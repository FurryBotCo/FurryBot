const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"user",
		"u"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Check if a user is blacklisted",
	usage: "<id>",
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
		let u, id, usr;
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		u = await message.getUserFromArgs();
		if(!u) return message.reply(`**${message.args[0]}** isn't a valid user.`);
		id = u.id;
		usr = await mdb.collection("users").findOne({ id });
		if(!usr) {
			console.debug(`Created user entry for ${id}`);
			await mdb.collection("users").insertOne(Object.assign(config.default.userConfig,{ id }));
			usr = await mdb.collection("users").findOne({ id });
		}

		if(!usr) return message.reply(`Failed to create user entry for **${id}**`);
		if(usr.blacklisted) return message.reply(`**${u.username}#${u.discriminator}** (${id}) is blacklisted, reason: ${usr.blacklistReason}.`);
		else return message.reply(`**${u.username}#${u.discriminator}** (${id}) is not blacklisted.`);
	})
};