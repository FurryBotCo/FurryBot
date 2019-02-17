module.exports = {
	triggers: [
		"bunny",
		"bun",
		"bunbun"
	],
	userPermissions: [],
	botPermissions: [
		"ATTACH_FILES"
	],
	cooldown: 3e3,
	description: "Get a picture of a cute bun!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		message.channel.startTyping();
		let req, response, attachment;
		try {
			req = await message.client.request("https://api.bunnies.io/v2/loop/random/?media=gif",{
				method: "GET",
				headers: {
					"User-Agent": message.client.config.web.userAgent
				}
			});
			response = JSON.parse(req.body);
			attachment = new message.client.Discord.MessageAttachment(response.media.gif,`${response.id}.gif`);
		}catch(error){
			console.log(error);
			attachment = new message.client.Discord.MessageAttachment(message.client.config.images.serverError);
		}
		message.channel.send(attachment);
		return message.channel.stopTyping();
	})
};