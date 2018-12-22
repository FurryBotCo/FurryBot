module.exports = {
	triggers: [
		"invite",
		"inv"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get some invite links for the bot",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: ()=>{}
};

module.exports = (async (self,local) => {
	
	var data = {
		"title": "Invites",
		"fields": [
			{
				name: "Discord Bot",
				value: self.config.bot.inviteLink,
				inline: false
			},
			{
				name: "Discord Server",
				value: self.config.bot.supportInvite,
				inline: false
			}
		]
	};
	
	Object.assign(data, local.embed_defaults());
	
	var embed = new self.Discord.MessageEmbed(data);
	return local.channel.send(embed);
});