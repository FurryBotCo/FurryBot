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
	run: (async (client,message) => {
		if (!client.config.developers.includes(message.author.id)) {
			return message.reply("You cannot run client command as you are not a developer of this bot.");
		}
		return message.reply("Tested!");
	})
};