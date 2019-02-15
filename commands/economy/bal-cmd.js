module.exports = {
	triggers: [
		"bal",
		"balance",
		"money"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	description: "Check your economy balance",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	run: (async function(message) {
		message.channel.startTyping();
		message.reply(`Your balance is ${message.uConfig.bal}.`);
		return message.channel.stopTyping();
	})
};