module.exports = {
	triggers: [
		"divorce"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Revoke your marriage..",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let member, m, u;
		if(!message.uConfig.married) return message.channel.createMessage(`<@!${message.author.id}>, You have to marry someone before you can divorce them..`);
		u = await this.bot.getRESTUser(message.uConfig.marriagePartner) || "Unknown#0000";
		message.channel.createMessage(`Are you sure you want to divorce **${u.username}#${u.discriminator}**? **yes** or **no**.`).then(async() => {
			const d = await this.MessageCollector.awaitMessage(message.channel.id, u.id, 6e4);
			if(!d || !["yes","no"].some(c => d.content.toLowerCase() === c)) return message.channel.createMessage(`<@!${message.author.id}>, that wasn't a valid option..`);
			if(d.content.toLowerCase() === "yes") {
				await this.mdb.collection("users").findOneAndUpdate({id: message.author.id},{
					$set: {
						married: false,
						marriagePartner: null
					}
				});
				await this.mdb.collection("users").findOneAndUpdate({id: message.uConfig.marriagePartner},{
					$set: {
						married: false,
						marriagePartner: null
					}
				});
				return message.channel.createMessage(`You've divorced **${u.username}#${u.discriminator}**...`);
			} else {
				return message.channel.createMessage(`<@!${message.author.id}>, You've stayed with **${u}**!`);
			}
		}).catch(err => message.channel.createMessage(`<@!${message.author.id}>, unknown error.`));
	})
};