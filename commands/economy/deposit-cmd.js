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
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	run: (async function(message) {
		let amount, u;
		u = await this.mdb.collection("users").findOne({id: message.author.id});
		try {
			amount = Number(message.args[0].replace(/[k]/i,"e3").replace(/[m]/i,"e6"));
		} catch(e) {
			return message.channel.createMessage(`<@!${message.author.id}>, Please provide a numeric value.`);
		}
		if(amount > u.bal) return message.channel.createMessage(`<@!${message.author.id}>, You do not have that much in your pocket.`);
		await this.mdb.collection("users").findOneAndUpdate({id: message.author.id},{$set: {bank: u.bank + amount, bal: u.bal - amount}}).then(this.logger.log);
		return message.channel.createMessage.channel.createMessage(`<@!${message.author.id}>, Deposited ${amount} ${this.config.emojis.owo}`);
	})
};