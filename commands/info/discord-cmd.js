module.exports=(async (message, gConfig) => {
	if(!message) return new Error ("missing message parameter");
	if(!gConfig) return new Error ("missing gConfig parameter");
	await require(`../../BaseCommand.js`)(message, gConfig);
	var data = {
		"title": "Discord",
		"description": `[Join Our Support Discord Server!](${config.discordSupportInvite})`,
		"thumbnail": {
			"url": "https://cdn.discordapp.com/embed/avatars/0.png"
		}
	};
	Object.assign(data, embed_defaults);
	var embed = new Discord.MessageEmbed(data);
	message.channel.send(embed);
});