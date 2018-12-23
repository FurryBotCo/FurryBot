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
	run: (async (self,local) => {
		local.channel.startTyping();
		var attachment = new self.Discord.MessageAttachment("https://foxrudor.de/","foxrudor.de.png");
		local.channel.send(attachment);
		return local.channel.stopTyping();
	})
};