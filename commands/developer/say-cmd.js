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
	run: (async(message) => {
		// extra check, to be safe
		if (!message.client.config.developers.includes(message.author.id)) return message.reply("You cannot run message.client command as you are not a developer of message.client bot.");
		return message.channel.send(message.unparseArgs);
	})
};