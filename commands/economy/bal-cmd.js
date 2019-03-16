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
	run: (async function(message) {
		let embed, data, u;
		u = await this.db.getUser(message.author.id);
		if(!u.bal) {
			await this.mdb.collection("users").findOneAndUpdate({id: message.author.id},{
				$set: {
					bal: 100
				}
			});
			u.bal = 100;
		}
		if(!u.bank) {
			await this.mdb.collection("users").findOneAndUpdate({id: message.author.id},{
				$set: {
					bank: 0
				}
			});
			u.bank = 0;
		}
		message.channel.startTyping();
		data = {
			title: `${message.author.tag}'s Balance`,
			description: `**Pocket**: ${u.bal}\n**Bank**: ${u.bank}`
		};
		Object.assign(data, message.embed_defaults());
		embed = new this.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};