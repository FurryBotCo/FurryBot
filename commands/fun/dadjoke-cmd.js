module.exports = {
	triggers: [
		"dadjoke",
		"joke"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 4e3,
	description: "Get a dadjoke!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		message.channel.startTyping();
		let req, j;
		req = await message.client.request("https://icanhazdadjoke.com",{
			headers:{
				Accept:"application/json",
				"User-Agent": message.client.config.web.userAgent
			}
		});
	
		j = JSON.parse(req.body);
	
		message.channel.send(j.joke);
		return message.channel.stopTyping();
	})
};