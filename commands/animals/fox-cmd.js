module.exports = {
	triggers: [
		"fox",
		"foxxo",
		"foxyboi"
	],
	userPermissions: [],
	botPermissions: [
		"ATTACH_FILES"
	],
	cooldown: 3e3,
	description: "Get a picture of a foxxo!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
		message.channel.startTyping();
		var attachment = new client.Discord.MessageAttachment("https://foxrudor.de/","foxrudor.de.png");
		message.channel.send(attachment);
		return message.channel.stopTyping();
	})
};