module.exports = {
	triggers: [
		"sofurry",
		"sf"
	],
	userPermissions: [],
	botPermissions: [
		"ATTACH_FILES",
		"EMBED_LINKS"
	],
	cooldown: 2e3,
	description: "Get a random post from sofurry!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		const contentType = [
			"story",
			"art",
			"music",
			"journal",
			"photo"
		];
		let tags, bl, req, jsn, rr, submission, short, extra, attachment;
		tags = message.unparseArgs.length > 0 ? message.unparseArgs.join("%20") : "furry";
		bl = tags.match(message.client.config.tagBlacklist);
		if(bl !== null && bl.length > 0) return message.reply(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);
		const msg = await message.channel.send(`Fetching.. ${message.client.config.emojis.load}`);
		req = await message.client.request(`https://api2.sofurry.com/browse/search?search=${tags}&format=json&minlevel=0&maxlevel=0`,{
			method: "GET",
			headers: {
				"User-Agent": message.client.config.web.userAgent
			}
		});
		try {
			jsn = JSON.parse(req.body);
			rr = Math.floor(Math.random()*jsn.data.entries.length);
			submission = jsn.data.entries[rr];
			if(typeof submission.contentLevel === "undefined") throw new Error("secondary");
			if(submission.contentLevel !== 0) {
				message.client.logger.log(`unsafe image:\n${message.client.util.inspect(submission,{depth:3,showHidden:true})}`);
				message.client.logger.log(`Body: ${message.client.inspect(jsn,{depth:null})}`);
				return msg.edit("Image API returned a non-safe image! Please try again later.").catch(err => message.channel.send(`Command failed: ${err}`));
			}
			short = await message.client.shortenUrl(`http://www.sofurry.com/view/${submission.id}`);
			extra = short.new ? `**message.client is the first time message.client has been viewed! Image #${short.linkNumber}**\n` : "";
			if([1,4].includes(submission.contentType)) {
				attachment = new message.client.Discord.MessageAttachment(submission.full,"sofurry.png");
				return msg.edit(`${extra}${submission.title} (type ${message.client.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<${short.url}>\nRequested By: ${message.author.tag}\nIf a bad image is returned, blame the service, not the bot author!`).catch(err => message.channel.send(`Command failed: ${err}`)).then(() => message.channel.send(attachment));
			} else {
				return msg.edit(`${extra}${submission.title} (type ${message.client.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nRequested By: ${message.author.tag}\nIf something bad is returned, blame the service, not the bot author!`).catch(err => message.channel.send(`Command failed: ${err}`));
			}
		}catch(e){
			message.client.logger.error(`Error:\n${e}`);
			message.client.logger.log(`Body: ${jsn}`);
			attachment = new message.client.Discord.MessageAttachment(message.client.config.images.serverError);
			return msg.edit("Unknown API Error").then(() => message.channel.send(attachment)).catch(err => message.channel.send(`Command failed: ${err}`));
		}
	})
};