module.exports = {
	triggers: [
		"sofurry",
		"sf"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",  // 32768
		"embedLinks" // 16384
	],
	cooldown: 2e3,
	description: "Get a random post from sofurry!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		return message.channel.createMessage(`<@!${message.author.id}>, Sorry, sofurry is having issues right now, and we cannot fetch anything from their api.\n(if it's back, and I haven't noticed, let me know in my support server - https://discord.gg/SuccpZw)`);
		/* eslint-disable no-unreachable */
		const contentType = [
			"story",
			"art",
			"music",
			"journal",
			"photo"
		];
		let tags, bl, req, jsn, rr, submission, short, extra, attachment;
		tags = message.unparsedArgs.length > 0 ? message.unparsedArgs.join("%20") : "furry";
		bl = tags.match(this.config.tagBlacklist);
		if(bl !== null && bl.length > 0) return message.channel.createMessage(`<@!${message.author.id}>, Your search contained blacklisted tags, **${bl.join("**, **")}**`);
		const msg = await message.channel.createMessage(`Fetching.. ${this.config.emojis.load}`);
		req = await this.request(`https://api2.sofurry.com/browse/search?search=${tags}&format=json&minlevel=0&maxlevel=0`,{
			method: "GET",
			headers: {
				"User-Agent": this.config.web.userAgent
			}
		});
		try {
			jsn = JSON.parse(req.body);
			rr = Math.floor(Math.random()*jsn.data.entries.length);
			submission = jsn.data.entries[rr];
			if(typeof submission.contentLevel === "undefined") throw new Error("secondary");
			if(submission.contentLevel !== 0) {
				this.logger.log(`unsafe image:\n${this.util.inspect(submission,{depth:3,showHidden:true})}`);
				this.logger.log(`Body: ${this.inspect(jsn,{depth:null})}`);
				return msg.edit("Image API returned a non-safe image! Please try again later.").catch(err => message.channel.createMessage(`Command failed: ${err}`));
			}
			short = await this.shortenUrl(`http://www.sofurry.com/view/${submission.id}`);
			extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
			if([1,4].includes(submission.contentType)) return msg.edit(`${extra}${submission.title} (type ${this.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<${short.url}>\nRequested By: ${message.author.username}#${message.author.discriminator}\nIf a bad image is returned, blame the service, not the bot author!`).catch(err => message.channel.createMessage(`Command failed: ${err}`)).then(async() => message.channel.createMessage("",{
				file: await this.getImageFromURL(submission.full),
				name: "sofurry.png"
			}));
			else return msg.edit(`${extra}${submission.title} (type ${this.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nRequested By: ${message.author.username}#${message.author.discriminator}\nIf something bad is returned, blame the service, not the bot author!`).catch(err => message.channel.createMessage(`Command failed: ${err}`));
		}catch(e){
			this.logger.error(`Error:\n${e}`);
			this.logger.log(`Body: ${req.body}`);
			return msg.edit("Unknown API Error").then(async() => message.channel.createMessage("",{
				file: await this.getImageFromURL(this.config.images.serverError),
				name: "error.png"
			})).catch(err => message.channel.createMessage(`Command failed: ${err}`));
		}
		/* eslint-enable no-unreachable */
	})
};