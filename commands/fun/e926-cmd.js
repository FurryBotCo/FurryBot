module.exports = {
	triggers: [
		"e926",
		"e9"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 0,
	description: "Get some fur images from e926",
	usage: "[tags]",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		//return message.channel.createMessage(`This command has been permanently disabled until Cloudflare stops giving us captchas, join our support server for updates on the status of this: ${this.config.bot.supportInvite}.`);
		
		let tags, bl, req, embed, postNumber, post;
		tags = encodeURIComponent(message.args.join(" "));
		bl = tags.match(this.config.tagBlacklist);
		if(bl !== null && bl.length > 0) return message.channel.createMessage(`<@!${message.author.id}>, Your search contained blacklisted tags, **${bl.join("**, **")}**`);
		try {
			req = await this.phin(`https://e926.net/post/index.json?limit=50&tags=${tags}%20rating%3Asafe`,{
				headers: {
					"User-Agent": this.config.web.userAgentExt("Donovan_DMC"),
					"Content-Type": "application/json"
				}
			}).then(res => res.body);
		} catch(e) {
			await message.channel.createMessage("unknown error while doing this..");
			return this.logger.error(e);
		}
		if(req.success !== undefined && req.success === false) return message.channel.createMessage(`<@!${message.author.id}>, error while running command: ${req.reason}`);
		if(req.length === 0) {
			embed = {
				title: "No Posts Found",
				description: `no posts were found with the tags "${decodeURIComponent(tags)}", try another query`
			};
			Object.assign(embed,message.embed_defaults());
			return message.channel.createMessage({ embed });
		} 
		postNumber = Math.floor(Math.random(0,req.length+1) * req.length);
		post = req[postNumber];
		if(!post) post = req[0];
		bl = post.tags.match(this.config.tagBlacklist);
		if(![undefined,null,""].includes(bl) && bl.length === 1) {
			this.logger.warn(`Blacklisted e926 post found, https://e926.net/post/show/${post.id}, blacklisted tag: ${bl[0]}`);
			return message.channel.createMessage(`<@!${message.author.id}>, I couldn't return the result as it contained blacklisted a tag: **${bl[0]}**`);
		} else if(![undefined,null,""].includes(bl) && bl.length > 1) {
			this.logger.warn(`Blacklisted e926 post found, https://e926.net/post/show/${post.id}, blacklisted tags: ${bl.join(", ")}`);
			return message.channel.createMessage(`<@!${message.author.id}>, I couldn't return the result as it contained blacklisted tags: **${bl.join("**, **")}**`);
		}
		if(!["s","safe"].includes(post.rating.toLowerCase())) return message.channel.createMessage(`<@!${message.author.id}>, API returned a non sfw image, please use the \`e621\` command if you are expecting nsfw results.`);
		embed = {
			title: "E926 Furs!",
			description: `Tags: ${this.truncate(post.tags.replace("_","\\_"),1900)}\n\nLink: <https://e926.net/post/show/${post.id}>`,
			image: {
				url: post.file_url
			}
		};
		return message.channel.createMessage({ embed });
	})
};