module.exports = {
	triggers: ["gay","homo"],
	userPermissions: [],
	botPermissions: [
        "ATTACH_FILES"
    ],
	cooldown: 0,
	description: "",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: ()=>{}
};

module.exports = (async(self,local)=>{
    local.channel.startTyping();
    if(local.args.length >= 1) {
        var imgurl = local.args.join("%20");
    } else if (local.message.attachments.first()) {
        var imgurl = local.message.attachments.first().url;
    } else if((m = local.channel.messages.filter(m=>m.attachments.size>=1)) && m.size >= 1) {
        var imgurl = m.last().url;
    } else {
        var imgurl = local.author.displayAvatarURL({format:"png"});
    }
    if(!imgurl) {
        local.message.reply("please either attach an image or provide a url");
        return local.channel.stopTyping();
    }
    var req = await self.request(`https://dankmemer.services/api/gay?avatar1=${imgurl}`,{
        method: "GET",
        headers: {
            Authorization: self.config.dankMemerAPIToken,
            "User-Agent": self.config.userAgent
        }
    });
    if(req.statusCode !== 200) {
        try {
            var j = JSON.parse(req.body);
        }catch(e){
            var j = {status:req.statusCode,message:"Unknown"};
        }
        local.message.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
        console.log(req.body);
        return local.channel.stopTyping();
    }
    var attachment = new self.Discord.MessageAttachment(req.body,"gay.png");
    local.channel.send(attachment).catch(err => local.message.reply(`Error sending: ${err}`));
    return local.channel.stopTyping();
})