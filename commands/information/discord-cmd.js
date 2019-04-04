module.exports = {
	triggers: [
		"discord"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 2e3,
	description: "Get a link to our Discord support server",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let embed;
		embed = {
			title: "Discord",
			description: `[Join Our Discord Server!](${this.config.bot.supportInvite})`,
			thumbnail: {
				url: "https://cdn.discordapp.com/embed/avatars/0.png"
			}
		};
		Object.assign(embed,message.embed_defaults());
		message.channel.createMessage({ embed });
	})
};