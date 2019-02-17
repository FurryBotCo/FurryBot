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
	run: (async(message) => {
		message.channel.stopTyping();
		let req, json, attachment;
		req = await message.client.request("https://aws.random.cat/meow",{
			method: "GET",
			headers: {
				"User-Agent": message.client.config.web.userAgent
			}
		});
		
		try {
			json = JSON.parse(req.body);
			attachment = new message.client.Discord.MessageAttachment(json.file);
		}catch(error){
			message.client.logger.error(error);
			attachment = new message.client.Discord.MessageAttachment(message.client.config.images.serverError);
		}
		message.channel.send(attachment);
		return message.channel.stopTyping();
			
	})
};