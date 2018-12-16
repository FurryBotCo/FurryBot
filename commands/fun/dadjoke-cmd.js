module.exports = (async (self,local) => {
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
});