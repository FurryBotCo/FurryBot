module.exports = {
	triggers: [
		"bird",
		"birb"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "Get a picture of a birb!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let img = await this.imageAPIRequest(true, "birb");
		try {
			return message.channel.createMessage("",{
				file: await this.getImageFromURL(img.response.image),
				name: img.response.name
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