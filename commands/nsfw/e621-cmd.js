module.exports = {
	triggers: [
		"e621",
		"e6"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Get some content from E621!",
	usage: "[tags]",
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		message.channel.startTyping();
		let tags, bl, req, res, data, embed, postNumber, post;
		tags = encodeURIComponent(message.args.join(" "));
		bl = tags.match(this.config.tagBlacklist);
		if(bl !== null && bl.length > 0) return message.reply(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);
		req = await this.request(`https://e621.net/post/index.json?limit=50&tags=${tags}%20rating%3Aexplict`,{
			method: "GET",
			headers: {
				"User-Agent": `FurryBot/${this.config.bot.version}`,
				"Content-Type": "application/json"
			}
		});
		res = JSON.parse(req.body);
		if(res.length === 0) {
			data = {
				title: "No Posts Found",
				description: `no posts were found with the tags "${decodeURIComponent(tags)}", try another query`
			};
			Object.assign(data,message.embed_defaults());
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} 
		postNumber = Math.floor(Math.random(0,res.length+1) * res.length);
		post = res[postNumber];
		if(!post) post = res[0];
		data = {
			title: "E621 Yiff!",
			description: `Tags: ${this.truncate(post.tags.replace("_","\\_"),1900)}\n\nLink: <https://e621.net/post/show/${post.id}>`,
			image: {
				url: post.file_url
			}
		};
		embed = new this.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};