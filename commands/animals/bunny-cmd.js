module.exports = {
	triggers: [
		"bunny",
		"bun",
		"bunbun"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "Get a picture of a cute bun!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		
		let req, response;
		try {
			req = await this.request("https://api.bunnies.io/v2/loop/random/?media=gif",{
				method: "GET",
				headers: {
					"User-Agent": this.config.web.userAgent
				}
			});
			response = JSON.parse(req.body);
			return message.channel.createMessage("",{
				file: await this.getImageFromURL(response.media.gif),
				name: `${response.id}.gif`
			});
		} catch(e) {
			this.logger.log(e);
			return message.channel.createMessage("unknown api error",{
				file: await this.getImageFromURL(this.config.images.serverError),
				name: "error.png"
			});
		}
	})
};