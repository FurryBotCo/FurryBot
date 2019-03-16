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
			return message.reply("Please provide a numeric value.");
		}
		if(amount > u.bank) return message.reply("You do not have that much in your bank.");
		await this.mdb.collection("users").findOneAndUpdate({id: message.author.id},{$set: {bank: u.bank - amount, bal: u.bal + amount}}).then(console.log);
		return message.reply(`Withdrew ${amount} ${this.config.emojis.owo}`);
	})
};