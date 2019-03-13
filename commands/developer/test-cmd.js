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
		if (!this.config.developers.includes(message.author.id)) return message.reply("You cannot run this command as you are not a developer of this bot.");
		return message.reply("Tested!");
	})
};