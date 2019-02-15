module.exports = {
	triggers: ["aborted","abort"],
	userPermissions: [],
	botPermissions: [
        "ATTACH_FILES"
    ],
	cooldown: 5e3,
	description: "Why someone should've been aborted",
	usage: "[image]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
        message.channel.startTyping();
        if(message.args.length >= 1) {
            // get member from message
        var user = await message.getUserFromArgs();
            var imgurl = user instanceof this.Discord.User ? user.displayAvatarURL({format:"png"}) : message.unparsedArgs.join("%20");
        } else if (message.attachments.first()) {
            var imgurl = message.attachments.first().url;
        } else if((m = message.channel.messages.filter(m=>m.attachments.size>=1)) && m.size >= 1) {
            var imgurl = m.last().attachments.first().url;
        } else {
            var imgurl = message.author.displayAvatarURL({format:"png"});
        }
        if(!imgurl) {
            message.reply("please either attach an image or provide a url");
            return message.channel.stopTyping();
        }
        var req = await this.memeRequest("/aborted",[imgurl]);
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
        var attachment = new this.Discord.MessageAttachment(req.body,"aborted.png");
        message.channel.send(attachment).catch(err => message.reply(`Error sending: ${err}`));
        return message.channel.stopTyping();
    })
};