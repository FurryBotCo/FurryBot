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
		"server",
		"s",
		"guild",
		"g"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Check if a server is blacklisted",
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
		let id, srv;
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		id = message.args[0];
		if(id.length < 17 || id.length > 18) return message.reply(`**${id}** isn't a valid server id.`);
		srv = await mdb.collection("guilds").findOne({ id });
		if(!srv) {
			console.debug(`Created guild entry for ${id}`);
			await mdb.collection("guilds").insertOne(Object.assign(config.default.guildConfig,{ id }));
			srv = await mdb.collection("guilds").findOne({ id });
		}

		if(!srv) return message.reply(`Failed to create guild entry for **${id}**`);
		if(srv.blacklisted) return message.reply(`**${id}** is blacklisted, reason: ${srv.blacklistReason}.`);
		else return message.reply(`**${id}** is not blacklisted.`);
	})
};