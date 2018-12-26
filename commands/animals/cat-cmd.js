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
	run: (async (client,message) => {
		message.channel.stopTyping();
		var req = await client.request("https://aws.random.cat/meow",{
			method: "GET",
			headers: {
				"User-Agent": client.config.web.userAgent
			}
		})
		
		try {
			var json=JSON.parse(xhr.responseText);
			var attachment = new client.Discord.MessageAttachment(json.file);
		}catch(e){
			client.logger.error(e);
			var attachment = new client.Discord.MessageAttachment(client.config.images.serverError);
		}
		message.channel.send(attachment);
		return message.channel.stopTyping();
			
	})
};