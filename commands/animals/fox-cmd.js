module.exports = {
	triggers: [
		"fox",
		"foxxo",
		"foxyboi"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "Get a picture of a foxxo!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		try {
			return message.channel.createMessage("",{
				file: await this.getImageFromURL("https://foxrudor.de/"),
				name: "foxrudor.de.png"
			});
		} catch(e) {
			this.logger.error(e);
			return message.channel.createMessage("unknown api error",{
				file: await this.getImageFromURL(this.config.images.serverError),
				name: "error.png"
			});
		}
	})
};