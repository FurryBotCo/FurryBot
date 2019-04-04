module.exports = {
	triggers: [
		"cat",
		"kitty",
		"kitten"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "Get a picture of a cat!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		try {
			return message.channel.createMessage("",{
				file: await this.getImageFromURL("https://cataas.com/cat/gif"),
				name: "cat.gif"
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