module.exports = {
	triggers: [
		"bal",
		"balance",
		"money"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	description: "Check your economy balance",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	run: (async(message) => {
		let embed, data, u;
		u = await message.client.db.getUser(message.author.id);
		if([undefined,null].includes(u.bal)) {
			await message.client.mdb.collection("users").findOneAndUpdate({id: message.author.id},{
				$set: {
					bal: 100
				}
			});
			u.bal = 100;
		}
		if(!u.bank) {
			await message.client.mdb.collection("users").findOneAndUpdate({id: message.author.id},{
				$set: {
					bank: 0
				}
			});
			u.bank = 0;
		}
		message.channel.startTyping();
		data = {
			title: `${message.author.tag}'s Balance`,
			description: `**Pocket**: ${u.bal} ${message.client.config.emojis.owo}\n**Bank**: ${u.bank} ${message.client.config.emojis.owo}`
		};
		Object.assign(data, message.embed_defaults());
		embed = new message.client.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};