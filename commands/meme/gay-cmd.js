module.exports = {
	triggers: ["gay","homo"],
	userPermissions: [],
	botPermissions: [
        "ATTACH_FILES"
    ],
	cooldown: 5e3,
	description: "Gay up an image",
	usage: "[image]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        message.channel.startTyping();
        if(message.args.length >= 1) {
            var imgurl = message.args.join("%20");
        } else if (message.attachments.first()) {
            var imgurl = message.attachments.first().url;
        } else if((m = message.channel.messages.filter(m=>m.attachments.size>=1)) && m.size >= 1) {
            var imgurl = m.last().url;
        } else {
            var imgurl = message.author.displayAvatarURL({format:"png"});
        }
        if(!imgurl) {
            message.reply("please either attach an image or provide a url");
            return message.channel.stopTyping();
        }
        var req = await client.request(`https://dankmemer.services/api/gay?avatar1=${imgurl}`,{
            method: "GET",
            headers: {
                Authorization: client.config.dankMemerAPIToken,
                "User-Agent": client.config.userAgent
            }
        });
        if(req.statusCode !== 200) {
            try {
                var j = JSON.parse(req.body);
            }catch(e){
                var j = {status:req.statusCode,message:"Unknown"};
            }
            message.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
            console.log(req.body);
            return message.channel.stopTyping();
        }
        var attachment = new client.Discord.MessageAttachment(req.body,"gay.png");
        message.channel.send(attachment).catch(err => message.reply(`Error sending: ${err}`));
        return message.channel.stopTyping();
    })
};