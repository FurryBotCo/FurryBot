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
		"withdraw",
		"with"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	description: "withdraw money from your bank into your pocket",
	usage: "<amount>",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let amount, u;
		u = await mdb.collection("users").findOne({id: message.author.id});
		try {
			amount = Number(message.args[0].replace(/[k]/i,"e3").replace(/[m]/i,"e6"));
		} catch(e) {
			return message.channel.createMessage(`<@!${message.author.id}>, Please provide a numeric value.`);
		}
		if(amount > u.bank) return message.channel.createMessage(`<@!${message.author.id}>, You do not have that much in your bank.`);
		await mdb.collection("users").findOneAndUpdate({id: message.author.id},{$set: {bank: u.bank - amount, bal: u.bal + amount}}).then(this.logger.log);
		return message.channel.createMessage(`<@!${message.author.id}>, Withdrew ${amount} ${config.emojis.owo}`);
	})
};