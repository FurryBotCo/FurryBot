module.exports = (async (self,local) => {
	local.channel.startTyping();
	try {
		var req = await self.request("https://api.bunnies.io/v2/loop/random/?media=gif",{
		method: "GET",
		headers: {
			"User-Agent": self.config.userAgent
		}
	});
	var response = JSON.parse(req.body);
	var attachment = new self.Discord.MessageAttachment(response.media.gif,`${response.id}.gif`);
	}catch(e){
		console.log(e);
		var attachment = new self.Discord.MessageAttachment("https://i.imgur.com/p4zFqH3.png");
	}
	local.channel.send(attachment);
	return local.channel.stopTyping();
});