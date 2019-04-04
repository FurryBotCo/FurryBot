module.exports = {
	triggers: [
		"balloon"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 5e3,
	description: "Nothing will pop this",
	usage: "<text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let text, req, j;
		text = message.unparsedArgs.join(" ");
		if(text.length === 0) text = "Image api, not providing text";
		req = await this.memeRequest("/balloon",[],text);
		if(req.statusCode !== 200) {
			try {
				j = {status:req.statusCode,message:JSON.stringify(req.body)};
			}catch(error){
				j = {status:req.statusCode,message:req.body};
			}
			message.channel.createMessage(`<@!${message.author.id}>, API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
			return this.logger.log(`text: ${text}`);
		}
		return message.channel.createMessage("",{
			file: req.body,
			name: "balloon.png"
		}).catch(err => message.channel.createMessage(`<@!${message.author.id}>, Error sending: ${err}`));
	})
};