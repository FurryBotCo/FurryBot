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
	run: (async(message) => {
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
		let ln, type, req, short, extra, attachment, jsn;
		if(message.args.length === 0 ) {
			ln = Math.floor(Math.random()*(types.length));
			// 0 (1) - 25: Inkbunny
			type = types[Math.floor(ln/25)];
		} else {
			type = message.args[0].toLowerCase();
			if(type === "list") return message.reply(`Valid Values:\n**${types.join("**\n**")}**.`);
		}
		try {
			if(!type) type = "hug";
			req = await message.client.imageAPIRequest(false,type,true,true);
			short = await message.client.shortenUrl(req.response.image);
			extra = short.new ? `**message.client is the first time message.client has been viewed! Image #${short.linkNumber}**\n` : "";
			attachment = new message.client.Discord.MessageAttachment(req.response.image);
			return message.channel.send(`${extra}Short URL: <${short.link}>\nRequested By: ${message.author.tag}\nType: ${message.client.ucwords(type)}`,attachment);
		}catch(error){
			message.client.logger.error(`Error:\n${error}`);
			message.client.logger.log(`Body: ${jsn}`);
			attachment = new message.client.Discord.MessageAttachment("https://fb.furcdn.net/NotFound.png");
			return message.channel.send("Unknown API Error",attachment);
		}
			
	})
};