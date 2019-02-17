module.exports = {
	triggers: [
		"dog",
		"doggo",
		"puppy"
	],
	userPermissions: [],
	botPermissions: [
		"ATTACH_FILES"
	],
	cooldown: 3e3,
	description: "Get a picture of a doggo!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		message.channel.startTyping();
		let req, j, parts, attachment;
		req = await message.client.request("https://dog.ceo/api/breeds/image/random",{
			method: "GET",
			headers: {
				"User-Agent": message.client.config.web.userAgent
			}
		});
		j = JSON.parse(req.body);
		parts = j.message.replace("https://","").split("/");
		
		attachment = new message.client.Discord.MessageAttachment(j.message,`${parts[2]}_${parts[3]}.png`);
		
		message.channel.send(`Breed: ${parts[2]}`,attachment);
		return message.channel.stopTyping();
	})
};