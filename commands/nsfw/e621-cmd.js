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
	run: (async(client,message) => {
        message.channel.startTyping();
        var tags = encodeURIComponent(message.args.join(" "));
        var req = await client.request(`https://e621.net/post/index.json?limit=50&tags=${tags}%20rating%3Aexplict`,{
            method: "GET",
            headers: {
                "User-Agent": `FurryBot/${client.config.bot.version}`,
                "Content-Type": "application/json"
            }
        });
        var res = JSON.parse(req.body);
        if(res.length < 1) {
            var data = {
                title: "No Posts Found",
                description: `no posts were found with the tags "${decodeURIComponent(tags)}", try another query`
            }
            Object.assign(data,message.embed_defaults());
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        } 
        var postNumber = Math.floor(Math.random(0,res.length+1) * res.length);
        var post = res[postNumber];
        if(!post) post = res[0];
        var data = {
            title: "E621 Yiff!",
            description: `Tags: ${client.truncate(post.tags.replace("_","\\_"),1900)}\n\nLink: <https://e621.net/post/show/${post.id}>`,
            image: {
                url: post.file_url
            }
        }
        var embed = new client.Discord.MessageEmbed(data);
        message.channel.send(embed);
        return message.channel.stopTyping();
    })
};