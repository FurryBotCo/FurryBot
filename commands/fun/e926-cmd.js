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
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let tags, bl, req, res, embed, postNumber, post;
		tags = encodeURIComponent(message.args.join(" "));
		bl = tags.match(this.config.tagBlacklist);
		if(bl !== null && bl.length > 0) return message.channel.createMessage(`<@!${message.author.id}>, Your search contained blacklisted tags, **${bl.join("**, **")}**`);
		req = await this.request(`https://e926.net/post/index.json?limit=50&tags=${tags}%20rating%3Asafe`,{
			method: "GET",
			headers: {
				"User-Agent": this.config.web.userAgentExt("Donovan_DMC"),
				"Content-Type": "application/json"
			}
		});
		res = JSON.parse(req.body);
		if(res.length === 0) {
			embed = {
				title: "No Posts Found",
				description: `no posts were found with the tags "${decodeURIComponent(tags)}", try another query`
			};
			Object.assign(embed,message.embed_defaults());
			return message.channel.createMessage({ embed });
		} 
		postNumber = Math.floor(Math.random(0,res.length+1) * res.length);
		post = res[postNumber];
		if(!post) post = res[0];
		embed = {
			title: "E926 Furs!",
			description: `Tags: ${this.truncate(post.tags.replace("_","\\_"),1900)}\n\nLink: <https://e926.net/post/show/${post.id}>`,
			image: {
				url: post.file_url
			}
		};
		message.channel.createMessage({ embed });
	})
};