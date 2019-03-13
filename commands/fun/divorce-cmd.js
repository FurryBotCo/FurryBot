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
		if(!message.uConfig.married) return message.reply("You have to marry someone before you can divorce them..");
		u = await this.users.fetch(message.uConfig.marriagePartner).then(res => res.tag) || "Unknown";
		message.channel.send(`Are you sure you want to divorce **${u}**? **yes** or **no**.`).then(() => {
			message.channel.awaitMessages(msg => msg.author.id === message.author.id && ["yes","no"].includes(msg.content.toLowerCase()),{
				max: 1,
				time: 6e4
			}).then(async(c) => {
				switch(c.first().content.toLowerCase()) {
				case "yes":
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
					return message.channel.send(`You've divorced **${u}**...`);
					break; // eslint-disable-line no-unreachable

				default:
					return message.reply(`You've stayed with **${u}**!`);
					break; // eslint-disable-line no-unreachable
				}
			}).catch(async(c) => {
				if(c instanceof this.Discord.Collection && c.size === 0) return message.channel.send("You did not reply in time, canceled!");
				this.logger.error(c);
				return message.channel.send("unknown error");
			});
		});
	})
};