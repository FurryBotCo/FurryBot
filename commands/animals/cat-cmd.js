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
		message.channel.stopTyping();
		let req, json, attachment;
		req = await this.request("https://aws.random.cat/meow",{
			method: "GET",
			headers: {
				"User-Agent": this.config.web.userAgent
			}
		});
		
		try {
			json = JSON.parse(req.body);
			attachment = new this.Discord.MessageAttachment(json.file);
		}catch(error){
			this.logger.error(error);
			attachment = new this.Discord.MessageAttachment(this.config.images.serverError);
		}
		message.channel.send(attachment);
		return message.channel.stopTyping();
			
	})
};