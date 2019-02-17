module.exports = {
	triggers: [
		"marry"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Propose to someone!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let member, m;
		member = await message.getMemberFromArgs();
		if(!member) return message.errorEmbed("INVALID_USER");
		m = await message.client.db.getUser(member.id);
		if(m.married !== true) {
			message.channel.send(`<@!${message.author.id}> has proposed to <@!${member.id}>!\n<@!${member.id}> do you accept? **yes** or **no**.`).then(() => {
				message.channel.awaitMessages(msg => msg.author.id === member.id && ["yes","no"].includes(msg.content.toLowerCase()),{
					max: 1,
					time: 6e4
				}).then(async(c) => {
					switch(c.first().content.toLowerCase()) {
					case "yes":
						await message.client.r.table("users").get(message.author.id).update({
							married: true,
							marriagePartner: member.id
						});
						await message.client.r.table("users").get(member.id).update({
							married: true,
							marriagePartner: message.author.id
						});
						return message.channel.send(`Congrats <@!${message.author.id}> and <@!${member.id}!`);
						break; // eslint-disable-line no-unreachable

					default:
						return message.reply("Better luck next time!");
						break; // eslint-disable-line no-unreachable
					}
				}).catch(async(c) => {
					if(c instanceof message.client.Discord.Collection && c.size === 0) return message.channel.send("User did not reply in time, canceled!");
					message.client.logger.error(c);
					return message.channel.send("unknown error");
				});
			});
		}
	})
};