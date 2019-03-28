module.exports = {
	triggers: [
		"say"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Make the bot say something",
	usage: "<text>",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		// extra check, to be safe
		if (!this.config.developers.includes(message.author.id)) return message.reply("You cannot run this command as you are not a developer of this bot.");
		return message.channel.send(message.unparsedArgs);
	})
};