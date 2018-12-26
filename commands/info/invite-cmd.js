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
	run: (async (client,message) => {
	
		var data = {
			"title": "Invites",
			"fields": [
				{
					name: "Discord Bot",
					value: client.config.bot.inviteLink,
					inline: false
				},
				{
					name: "Discord Server",
					value: client.config.bot.supportInvite,
					inline: false
				}
			]
		};
		
		Object.assign(data, message.embed_defaults());
		
		var embed = new client.Discord.MessageEmbed(data);
		return message.channel.send(embed);
	})
};