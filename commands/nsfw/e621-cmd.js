module.exports = {
	triggers: [
		"e621",
		"e6"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks", // 16834
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "Get some content from E621!",
	usage: "[tags]",
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		
		let tags, bl, req, embed, postNumber, post;
		tags = encodeURIComponent(message.args.join(" "));
		bl = tags.match(this.config.tagBlacklist);
		if(bl !== null && bl.length > 0) return message.channel.createMessage(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);
		try {
			req = await this.phin({
				url: `https://e621.net/post/index.json?limit=50&tags=${tags}%20rating%3Aexplict`,
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
			this.logger.warn(`Blacklisted e621 post found, https://e621.net/post/show/${post.id}, blacklisted tag: ${bl[0]}`);
			return message.channel.createMessage(`<@!${message.author.id}>, I couldn't return the result as it contained blacklisted a tag.\nBlacklisted Tag: **${bl[0]}**`);
		} else if(![undefined,null,""].includes(bl) && bl.length > 1) {
			this.logger.warn(`Blacklisted e621 post found, https://e621.net/post/show/${post.id}, blacklisted tags: ${bl.join(", ")}`);
			return message.channel.createMessage(`<@!${message.author.id}>, I couldn't return the result as it contained blacklisted tags.\nBlacklisted Tags: **${bl.join("**, **")}**`);
		}
		embed = {
			title: "E621 Yiff!",
			description: `Tags: ${this.truncate(post.tags.replace("_","\\_"),1900)}\n\nLink: <https://e621.net/post/show/${post.id}>`,
			image: {
				url: post.file_url
			}
		};
		return message.channel.createMessage({ embed });
	})
};