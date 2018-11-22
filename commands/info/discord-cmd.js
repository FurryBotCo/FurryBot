module.exports = (async (self,local) => {
	
	var data = {
		"title": "Discord",
		"description": `[Join Our Support Discord Server!](${self.config.discordSupportInvite})`,
		"thumbnail": {
			"url": "https://cdn.discordapp.com/embed/avatars/0.png"
		}
	};
	Object.assign(data,self.embed_defaults());
	var embed = new self.Discord.MessageEmbed(data);
	local.channel.send(embed);
});