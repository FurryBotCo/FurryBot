module.exports = {
	triggers: [
		"test"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		// extra check, to be safe
		if (!this.config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer of this bot.`);
		throw new Error("This is a test error, thrown and not caught on purpose for testing purposes.");
		//return message.channel.createMessage(`<@!${message.author.id}>, Tested!`);
	})
};