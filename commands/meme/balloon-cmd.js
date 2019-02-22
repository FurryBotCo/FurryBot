module.exports = {
	triggers: ["balloon"],
	userPermissions: [],
	botPermissions: [
		"ATTACH_FILES"
	],
	cooldown: 5e3,
	description: "Nothing will pop this",
	usage: "<text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		message.channel.startTyping();
		let text, req, attachment, j;
		text = message.unparsedArgs.join(" ");
		if(text.length === 0) text = "Image api, not providing text";
		req = await message.client.memeRequest("/balloon",[],text);
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
		attachment = new message.client.Discord.MessageAttachment(req.body,"balloon.png");
		message.channel.send(attachment).catch(err => message.reply(`Error sending: ${err}`));
		return message.channel.stopTyping();
	})
};