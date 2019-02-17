module.exports = {
	triggers: [
		"discord"
	],
	userPermissions: [],
	botPermissions: [
		"EMBED_LINKS"
	],
	cooldown: 2e3,
	description: "Get a link to our Discord support server",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let data, embed;
		data = {
			title: "Discord",
			description: `[Join Our Discord Server!](${message.client.config.bot.supportInvite})`,
			thumbnail: {
				url: "https://cdn.discordapp.com/embed/avatars/0.png"
			}
		};
		Object.assign(data,message.embed_defaults());
		embed = new message.client.Discord.MessageEmbed(data);
		message.channel.send(embed);
	})
};