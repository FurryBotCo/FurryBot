module.exports = (async(self,local)=>{
    local.channel.startTyping();
    var tags = encodeURIComponent(local.args.join(" "));
    var req = await self.request(`https://e926.net/post/index.json?limit=50&tags=${tags}%20rating%3Asafe`,{
        method: "GET",
        headers: {
            "User-Agent": `FurryBot/${self.config.bot.version}`,
            "Content-Type": "application/json"
        }
    });
    var res = JSON.parse(req.body);
    if(res.length < 1) {
        var data = {
            title: "No Posts Found",
            description: `no posts were found with the tags "${decodeURIComponent(tags)}", try another query`
        }
        Object.assign(data,local.embed_defaults());
        var embed = new self.Discord.MessageEmbed(data);
        return local.channel.send(embed);
    } 
    var postNumber = Math.floor(Math.random(0,res.length+1) * res.length);
    var post = res[postNumber];
    if(!post) post = res[0];
    var data = {
        title: "E926 Furs!",
        description: `Tags: ${self.truncate(post.tags.replace("_","\\_"),1900)}\n\nLink: <https://e926.net/post/show/${post.id}>`,
        image: {
            url: post.file_url
        }
    }
    var embed = new self.Discord.MessageEmbed(data);
    local.channel.send(embed);
    return local.channel.stopTyping();
})