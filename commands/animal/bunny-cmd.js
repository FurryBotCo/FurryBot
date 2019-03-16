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
	run: (async function(message) {
		message.channel.startTyping();
		let req, response, attachment;
		try {
			req = await this.request("https://api.bunnies.io/v2/loop/random/?media=gif",{
				method: "GET",
				headers: {
					"User-Agent": this.config.web.userAgent
				}
			});
			response = JSON.parse(req.body);
			attachment = new this.Discord.MessageAttachment(response.media.gif,`${response.id}.gif`);
		}catch(error){
			console.log(error);
			attachment = new this.Discord.MessageAttachment(this.config.images.serverError);
		}
		message.channel.send(attachment);
		return message.channel.stopTyping();
	})
};