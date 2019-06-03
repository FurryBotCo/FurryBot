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
		"prune",
		"purge",
		"clear"
	],
	userPermissions: [
		"manageMessages" // 8192
	],
	botPermissions: [
		"manageMessages" // 8192
	],
	cooldown: .5e3,
	description: "Clear messages in a channel",
	usage: "<2-100>",
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
		if(message.args.length === 0 || isNaN(message.args[0])) return new Error("ERR_INVALID_USAGE");
		if(message.args[0] < 2 || message.args[0] > 100) return message.channel.createMessage(`<@!${message.author.id}>, Please provide a number between 2`);
		if(message.args[0] < 100) message.args[0]++;

		const m = await message.channel.getMessages(message.args[0]);
		const f = m.filter(d => !(d.timestamp + 12096e5 < Date.now()));
		await message.channel.deleteMessages(f.map(j => j.id));
		if(m.length !== f.length) await message.channel.createMessage(`Skipped ${m.length - f.length} message(s), reason: over 2 weeks old.`);
	})
};