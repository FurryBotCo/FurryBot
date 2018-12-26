module.exports = {
	triggers: [
        "e926",
        "e9"
    ],
	userPermissions: [],
	botPermissions: [
        "ATTACH_FILES"
    ],
	cooldown: 0,
	description: "Get some fur images from e926",
	usage: "[tags]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message) => {
        message.channel.startTyping();
        var tags = encodeURIComponent(message.args.join(" "));
        var req = await client.request(`https://e926.net/post/index.json?limit=50&tags=${tags}%20rating%3Asafe`,{
            method: "GET",
            headers: {
                "User-Agent": client.config.web.userAgentExt("Donvan_DMC"),
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
            title: "E926 Furs!",
            description: `Tags: ${client.truncate(post.tags.replace("_","\\_"),1900)}\n\nLink: <https://e926.net/post/show/${post.id}>`,
            image: {
                url: post.file_url
            }
        }
        var embed = new client.Discord.MessageEmbed(data);
        message.channel.send(embed);
        return message.channel.stopTyping();
    })
};