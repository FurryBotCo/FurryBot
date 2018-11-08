module.exports=(async (message, gConfig) => {
	if(!message) return new Error ("missing message parameter");
	if(!gConfig) return new Error ("missing gConfig parameter");
	await require(`../../BaseCommand.js`)(message, gConfig);
	var data={
		"title": "Invites",
		"fields": [
			{
				name: "Discord Bot",
				value: config.discordInviteLink,
				inline: false
			},
			{
				name: "Discord Support Server",
				value: config.discordSupportInvite,
				inline: false
			}
		]
	};
	
	Object.assign(data, embed_defaults);
	
	var embed = new Discord.MessageEmbed(data);
	return message.channel.send(embed);
});