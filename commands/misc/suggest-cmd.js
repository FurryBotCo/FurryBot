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
		let card, data, embed;
		if(message.unparsedArgs.length === 0 || !message.unparsedArgs[0]) return new Error("ERR_INVALID_USAGE");
		try {
			card = await this.tthis.addCard(message.unparsedArgs.join(" "),`Suggestion by ${message.author.tag} (${message.author.id}) from guild ${message.guild.name} (${message.guild.id})`,this.config.apis.trello.list);
		}catch(error) {
			return message.reply(`Failed to create card: **${error.message}**`);
		}
		await this.tclient.addLabelToCard(card.id,this.config.apis.trello.labels.approval).catch(err => this.logger.log(err));
		message.reply(`Suggestion posted!\nView it here: ${card.shortUrl}`);
		
		data = {
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
		embed = new this.Discord.MessageEmbed(data);
		return this.channels.get(this.config.bot.channels.suggestion).send(embed).then(async(msg) => {
			await msg.react("542963565150208001");
			await msg.react("542963565238288384");
			await msg.react("❌");
		});
	})
};