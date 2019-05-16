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
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let amount, u;
		u = await this.mdb.collection("users").findOne({id: message.author.id});
		try {
			amount = Number(message.args[0].replace(/[k]/i,"e3").replace(/[m]/i,"e6"));
		} catch(e) {
			return message.channel.createMessage(`<@!${message.author.id}>, Please provide a numeric value.`);
		}
		if(amount > u.bank) return message.channel.createMessage(`<@!${message.author.id}>, You do not have that much in your bank.`);
		await this.mdb.collection("users").findOneAndUpdate({id: message.author.id},{$set: {bank: u.bank - amount, bal: u.bal + amount}}).then(this.logger.log);
		return message.channel.createMessage(`<@!${message.author.id}>, Withdrew ${amount} ${this.config.emojis.owo}`);
	})
};