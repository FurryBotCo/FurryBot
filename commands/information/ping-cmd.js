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
		"ping",
		"pong"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: .5e3,
	description: "Get the bots ping",
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
		let m = await message.channel.createMessage("Checking Ping..");
		m.edit("Ping Calculated!");
		m.delete().catch(noerr => null);
		return message.channel.createMessage(`Client Ping: ${(m.timestamp - message.timestamp)}ms${"\n"}Shard Ping: ${Math.round(message.guild.shard.latency)}ms`);
	})
};