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
		"deposit",
		"dep"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	description: "Deposit money into your bank from your pocket",
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
		if(amount > u.bal) return message.channel.createMessage(`<@!${message.author.id}>, You do not have that much in your pocket.`);
		await mdb.collection("users").findOneAndUpdate({id: message.author.id},{$set: {bank: u.bank + amount, bal: u.bal - amount}}).then(this.logger.log);
		return message.channel.createMessage.channel.createMessage(`<@!${message.author.id}>, Deposited ${amount} ${config.emojis.owo}`);
	})
};