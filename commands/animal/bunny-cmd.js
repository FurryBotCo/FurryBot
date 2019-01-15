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
	run: (async (client,message) => {
		message.channel.startTyping();
		try {
			var req = await client.request("https://api.bunnies.io/v2/loop/random/?media=gif",{
			method: "GET",
			headers: {
				"User-Agent": client.config.web.userAgent
			}
		});
		var response = JSON.parse(req.body);
		var attachment = new client.Discord.MessageAttachment(response.media.gif,`${response.id}.gif`);
		}catch(e){
			console.log(e);
			var attachment = new client.Discord.MessageAttachment(client.config.images.serverError);
		}
		message.channel.send(attachment);
		return message.channel.stopTyping();
	})
};