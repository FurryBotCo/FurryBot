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
	run: (async function(message) {
		if(message.unparsedArgs.length < 1 || !message.unparsedArgs[0]) return new Error("ERR_INVALID_USAGE");
		try {
			var card = await this.tthis.addCard(message.unparsedArgs.join(" "),`Suggestion by ${message.author.tag} (${message.author.id}) from guild ${message.guild.name} (${message.guild.id})`,this.config.apis.trello.list);
		}catch(e) {
			return message.reply(`Failed to create card: **${e.message}**`);
		}
		await this.tthis.addLabelToCard(card.id,this.config.apis.trello.labels.approval).catch(error=>{return error;});
		//await tthis.addMemberToCard(card.id,config.trello.members.donovan_dmc).catch(error=>{return error;});
		message.reply(`Suggestion posted!\nView it here: ${card.shortUrl}`);
		
		var data = {
			title: `Suggestion by ${message.author.tag} (${message.author.id}) from guild ${message.guild.name} (${message.guild.id})`,
			description: this.truncate(message.unparsedArgs.join(" "),950),
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
		var embed = new this.Discord.MessageEmbed(data);
		return this.channels.get(this.config.bot.channels.suggestion).send(embed).then(async(msg) {
			await msg.react("542963565150208001");
			await msg.react("542963565238288384");
			await msg.react("❌");
		});
    })
};