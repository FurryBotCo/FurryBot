module.exports = {
	triggers: [
		"marry"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Propose to someone!",
	usage: "<@user>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let member, m, u;
		member = await message.getMemberFromArgs();
		if(!member) return message.errorEmbed("INVALID_USER");
		m = await this.mdb.collection("users").findOne({id: member.id});

		if(message.uConfig.married) {
			u = await this.bot.getRESTUser(message.uConfig.marriagePartner).then(res => `${res.username}#${res.discriminator}`) || "Unknown#0000";
			return message.createMessage(`<@!${message.author.id}>, Hey, hey! You're already married to **${u}**! You can get a divorce though..`);
		}

		if(m.married) {
			u = await this.bot.getRESTUser(m.marriagePartner).then(res => `${res.username}#${res.discriminator}`) || "Unknown#0000";
			return message.channel.createMessage(`<@!${message.author.id}>, Hey, hey! They're already married to **${u}**!`);
		}
		message.channel.createMessage(`<@!${message.author.id}> has proposed to <@!${member.id}>!\n<@!${member.id}> do you accept? **yes** or **no**.`).then(async() => {
			const d = await this.MessageCollector.awaitMessage(message.channel.id, member.id, 6e4);
			if(!d || !["yes","no"].some(c => d.content.toLowerCase() === c)) return message.channel.createMessage(`<@!${message.author.id}>, that wasn't a valid option..`);
			if(d.content.toLowerCase() === "yes") {
				await this.mdb.collection("users").findOneAndUpdate({id: message.author.id},{
					$set: {
						married: true,
						marriagePartner: member.id
					}
				});
				await this.mdb.collection("users").findOneAndUpdate({id: member.id},{
					$set: {
						married: true,
						marriagePartner: message.author.id
					}
				});
				return message.channel.createMessage(`Congrats <@!${message.author.id}> and <@!${member.id}>!`);
			} else {
				return message.channel.createMessage(`<@!${message.author.id}>, Better luck next time!`);
			}
		}).catch(err => {
			this.logger.error(err);
			return message.channel.createMessage(`<@!${message.author.id}>, unknown error.`);
		});
	})
};