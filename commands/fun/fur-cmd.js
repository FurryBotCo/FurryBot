module.exports=(async (self,local) => {
	
	if(local.args.length === 0 ) {
		const types = [
			"boop",
			"cuddle",
			"fursuit",
			"hold",
			"hug",
			"kiss",
			"lick",
			"propose"
		];
		var ln = Math.floor(Math.random()*(types.length));
		// 0 (1) - 25: Inkbunny
		var type = types[Math.floor(ln/25)];
	} else {
		var type = local.args[0].toLowerCase();
		if(type === "list") return local.message.reply(`Valid Values:\n**${types.join("**\n**")}**.`);
	}
	try {
		if(!type) type = "hug";
		var req = await self.imageAPIRequest(true,type);
		var short = await self.shortenUrl(req.response.image);
		var extra = short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
		var attachment = new self.Discord.MessageAttachment(req.response.image);
		return local.channel.send(`${extra}Short URL: <${short.link}>\nRequested By: ${local.author.tag}\nType: ${self.ucwords(type)}`,attachment);
	}catch(e){
		self.logger.error(`Error:\n${e}`);
		self.logger.log(`Body: ${jsn}`);
		var attachment = new self.Discord.MessageAttachment("https://fb.furcdn.net/NotFound.png");
		return local.channel.send("Unknown API Error",attachment);
	}
		
});