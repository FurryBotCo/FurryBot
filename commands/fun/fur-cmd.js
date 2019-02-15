module.exports = {
	triggers: [
		"fur"
	],
	userPermissions: [],
	botPermissions: [
		"ATTACH_FILES"
	],
	cooldown: 2e3,
	description: "Get a random fur image! use `fur list	 to get a list of all supported types!",
	usage: "[type]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
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
		if(message.args.length === 0 ) {
			var ln = Math.floor(Math.random()*(types.length));
			// 0 (1) - 25: Inkbunny
			var type = types[Math.floor(ln/25)];
		} else {
			var type = message.args[0].toLowerCase();
			if(type === "list") return message.reply(`Valid Values:\n**${types.join("**\n**")}**.`);
		}
		try {
			if(!type) type = "hug";
			var req = await this.imageAPIRequest(true,type);
			var short = await this.shortenUrl(req.response.image);
			var extra = short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
			var attachment = new this.Discord.MessageAttachment(req.response.image);
			return message.channel.send(`${extra}Short URL: <${short.link}>\nRequested By: ${message.author.tag}\nType: ${this.ucwords(type)}`,attachment);
		}catch(e){
			this.logger.error(`Error:\n${e}`);
			this.logger.log(`Body: ${jsn}`);
			var attachment = new this.Discord.MessageAttachment("https://fb.furcdn.net/NotFound.png");
			return message.channel.send("Unknown API Error",attachment);
		}
			
	})
};