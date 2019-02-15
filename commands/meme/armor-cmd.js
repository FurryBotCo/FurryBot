module.exports = {
	triggers: ["armor"],
	userPermissions: [],
	botPermissions: [
        "ATTACH_FILES"
    ],
	cooldown: 5e3,
	description: "Nothing can penetrate my armor.",
	usage: "<text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
        message.channel.startTyping();
        var text = message.unparsedArgs.join(" ");
        if(text.length === 0) var text = "Provide some text";
        var req = await this.memeRequest("/armor",[],text);
        if(req.statusCode !== 200) {
            try {
                var j = {status:req.statusCode,message:JSON.stringify(req.body)};
            }catch(e){
                var j = {status:req.statusCode,message:req.body};
            }
            message.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
            console.log(`text: ${text}`);
            return message.channel.stopTyping();
        }
        var attachment = new this.Discord.MessageAttachment(req.body,"armor.png");
        message.channel.send(attachment).catch(err => message.reply(`Error sending: ${err}`));
        return message.channel.stopTyping();
    })
};