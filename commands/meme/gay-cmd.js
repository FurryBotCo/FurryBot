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
            // get member from message
        var user = await message.getUserFromArgs();
            var imgurl = user instanceof client.Discord.User ? user.displayAvatarURL({format:"png"}) : message.unparsedArgs.join("%20");
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
        var req = await client.memeRequest("/gay",[imgurl]);
        if(req.statusCode !== 200) {
            try {
                var j = {status:req.statusCode,message:JSON.stringify(req.body)};
            }catch(e){
                var j = {status:req.statusCode,message:req.body};
            }
            message.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
            console.log(`imgurl: ${imgurl}`);
            return message.channel.stopTyping();
        }
        var attachment = new client.Discord.MessageAttachment(req.body,"gay.png");
        message.channel.send(attachment).catch(err => message.reply(`Error sending: ${err}`));
        return message.channel.stopTyping();
    })
};