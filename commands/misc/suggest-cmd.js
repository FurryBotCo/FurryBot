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
	run: (async (client,message) => {
		if(message.unparseArgs.length < 1 || !message.unparseArgs[0]) return new Error("ERR_INVALID_USAGE");
		try {
			var card = await client.tclient.addCard(message.unparsedArgs.join(" "),`Suggestion by ${message.author.tag} (${message.author.id}) from guild ${message.guild.name} (${message.guild.id})`,client.config.trello.list);
		}catch(e) {
			return message.reply(`Failed to create card: **${e.message}**`);
		}
		await client.tclient.addLabelToCard(card.id,client.config.trello.labels.approval).catch(error=>{return error;});
		//await tclient.addMemberToCard(card.id,config.trello.members.donovan_dmc).catch(error=>{return error;});
		message.reply(`Suggestion posted!\nView it here: ${card.shortUrl}`);
		
		var data = {
			title: `Suggestion by ${message.author.tag} (${message.author.id}) from guild ${message.guild.name} (${message.guild.id})`,
			description: client.truncate(client.unparsedArgs.join(" "),950),
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
		var embed = new client.Discord.MessageEmbed(data);
		return client.channels.get(client.config.bot.channels.suggestion).send(embed).then(message=>{
			message.react("478050584923209728");
			message.react("478050584898043904");
			message.react("❌");
		});
    })
};