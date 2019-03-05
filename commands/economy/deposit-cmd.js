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
	run: (async(message) => {
		let amount, u;
		u = await message.client.mdb.collection("users").findOne({id: message.author.id});
		try {
			amount = Number(message.args[0].replace(/[k]/i,"e3").replace(/[m]/i,"e6"));
		} catch(e) {
			return message.reply("Please provide a numeric value.");
		}
		if(amount > u.bal) return message.reply("You do not have that much in your pocket.");
		await message.client.mdb.collection("users").findOneAndUpdate({id: message.author.id},{$set: {bank: u.bank + amount, bal: u.bal - amount}}).then(console.log);
		return message.reply(`Deposited ${amount} ${message.client.config.emojis.owo}`);
	})
};