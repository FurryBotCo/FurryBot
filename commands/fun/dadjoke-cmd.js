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
	run: (async (self,local) => {
		local.channel.startTyping();
		var req = await self.request("https://icanhazdadjoke.com",{
			headers:{
				Accept:"application/json",
				"User-Agent": self.config.web.userAgent
			}
		});
	
		var j = JSON.parse(req.body);
	
		local.channel.send(j.joke);
		return local.channel.stopTyping();
	})
};