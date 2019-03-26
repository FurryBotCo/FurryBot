module.exports = {
	triggers: [
		"cat",
		"kitty",
		"kitten"
	],
	userPermissions: [],
	botPermissions: [
		"ATTACH_FILES"
	],
	cooldown: 3e3,
	description: "Get a picture of a cat!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		message.channel.startTyping();
		let attachment;
		try {
			attachment = new this.Discord.MessageAttachment("https://cataas.com/cat/gif","cat.gif");
		}catch(error){
			this.logger.error(error);
			attachment = new this.Discord.MessageAttachment(this.config.images.serverError);
		}
		message.channel.send(attachment);
		return message.channel.stopTyping();
			
	})
};