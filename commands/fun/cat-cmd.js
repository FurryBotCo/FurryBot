module.exports = (async (self,local) => {
	local.channel.stopTyping();
	var req = await self.request("https://aws.random.cat/meow",{
		method: "GET",
		headers: {
			"User-Agent": self.config.userAgent
		}
	})
	
	try {
		var json=JSON.parse(xhr.responseText);
		var attachment = new self.Discord.messageAttachment(json.file);
	}catch(e){
		console.log(e);
		var attachment = new self.Discord.messageAttachment("https://i.imgur.com/p4zFqH3.png");
	}
	local.channel.send(attachment);
	return local.channel.stopTyping();
		
});