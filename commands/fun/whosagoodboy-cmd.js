module.exports = {
	triggers: [
		"whosagoodboy",
		"whosagoodboi",
		"goodboi"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Who's a good boy?!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		return message.reply("Yip! Yip! I am! I am! :fox:");
	})
};