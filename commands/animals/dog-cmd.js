module.exports = {
	triggers: [
		"dog",
		"doggo",
		"puppy"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "Get a picture of a doggo!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let req, j, parts;
		try {
			req = await this.request("https://dog.ceo/api/breeds/image/random",{
				method: "GET",
				headers: {
					"User-Agent": this.config.web.userAgent
				}
			});
			j = JSON.parse(req.body);
			parts = j.message.replace("https://","").split("/");
			
			return message.channel.createMessage(`Breed: ${parts[2]}`,{
				file: await this.getImageFromURL(j.message),
				name: `${parts[2]}_${parts[3]}.png`
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