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
		m = await this.db.getUser(member.id);

		if(message.uConfig.married) {
			u = await this.users.fetch(message.uConfig.marriagePartner).then(res => res.tag) || "Unknown#0000";
			return message.reply(`Hey, hey! You're already married to **${u}**! You can get a divorce though..`);
		}

		if(m.married) {
			u = await this.users.fetch(m.marriagePartner).then(res => res.tag) || "Unknown#0000";
			return message.reply(`Hey, hey! They're already married to **${u}**!`);
		}
		message.channel.send(`<@!${message.author.id}> has proposed to <@!${member.id}>!\n<@!${member.id}> do you accept? **yes** or **no**.`).then(() => {
			message.channel.awaitMessages(msg => msg.author.id === member.id && ["yes","no"].includes(msg.content.toLowerCase()),{
				max: 1,
				time: 6e4
			}).then(async(c) => {
				switch(c.first().content.toLowerCase()) {
				case "yes":
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
					return message.channel.send(`Congrats <@!${message.author.id}> and <@!${member.id}>!`);
					break; // eslint-disable-line no-unreachable

				default:
					return message.reply("Better luck next time!");
					break; // eslint-disable-line no-unreachable
				}
			}).catch(async(c) => {
				if(c instanceof this.Discord.Collection && c.size === 0) return message.channel.send("User did not reply in time, canceled!");
				this.logger.error(c);
				return message.channel.send("unknown error");
			});
		});
	})
};