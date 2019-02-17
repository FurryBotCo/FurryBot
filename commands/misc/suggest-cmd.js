module.exports = {
	triggers: [
		"suggest"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 18e5,
	description: "Suggest something for the bot!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let card, data, embed;
		if(message.unparsedArgs.length === 0 || !message.unparsedArgs[0]) return new Error("ERR_INVALID_USAGE");
		try {
			card = await message.client.tmessage.client.addCard(message.unparsedArgs.join(" "),`Suggestion by ${message.author.tag} (${message.author.id}) from guild ${message.guild.name} (${message.guild.id})`,message.client.config.apis.trello.list);
		}catch(error) {
			return message.reply(`Failed to create card: **${error.message}**`);
		}
		await message.client.tclient.addLabelToCard(card.id,message.client.config.apis.trello.labels.approval).catch(err => message.client.logger.log(err));
		message.reply(`Suggestion posted!\nView it here: ${card.shortUrl}`);
		
		data = {
			title: `Suggestion by ${message.author.tag} (${message.author.id}) from guild ${message.guild.name} (${message.guild.id})`,
			description: message.client.truncate(message.unparsedArgs.join(" "),950),
			thumbnail: message.author.displayAvatarURL(),
			fields: [
				{
					name: "Trello Card",
					value: card.shortUrl,
					inline: false
				}
			]
		};
		Object.assign(data,message.embed_defaults());
		embed = new message.client.Discord.MessageEmbed(data);
		return message.client.channels.get(message.client.config.bot.channels.suggestion).send(embed).then(async(msg) => {
			await msg.react("542963565150208001");
			await msg.react("542963565238288384");
			await msg.react("❌");
		});
	})
};