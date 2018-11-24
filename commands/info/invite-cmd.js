module.exports = (async (self,local) => {
	
	var data = {
		"title": "Invites",
		"fields": [
			{
				name: "Discord Bot",
				value: self.config.discordInviteLink,
				inline: false
			},
			{
				name: "Discord Server",
				value: self.config.discordSupportInvite,
				inline: false
			}
		]
	};
	
	Object.assign(data, self.embed_defaults());
	
	var embed = new self.Discord.MessageEmbed(data);
	return local.channel.send(embed);
});