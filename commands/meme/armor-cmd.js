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
		let text, req, j, attachment;
		text = message.unparsedArgs.join(" ");
		if(text.length === 0) text = "Provide some text";
		req = await this.memeRequest("/armor",[],text);
		if(req.statusCode !== 200) {
			try {
				j = {status:req.statusCode,message:JSON.stringify(req.body)};
			}catch(error){
				j = {status:req.statusCode,message:req.body};
			}
			message.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
			console.log(`text: ${text}`);
			return message.channel.stopTyping();
		}
		attachment = new this.Discord.MessageAttachment(req.body,"armor.png");
		message.channel.send(attachment).catch(err => message.reply(`Error sending: ${err}`));
		return message.channel.stopTyping();
	})
};