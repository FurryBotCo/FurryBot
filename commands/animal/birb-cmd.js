module.exports = {
	triggers: [
		"bird",
		"birb"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Get a picture of a birb!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		//return message.reply("Sorry, the api we used was shutdown, so message.client is temporarily disabled!");]
		message.channel.startTyping();
		let img, attachment;
		img = await message.client.imageAPIRequest(true, "birb");
		try {
			attachment = new message.client.Discord.MessageAttachment(img.response.image,img.response.name);
		}catch(error){
			console.log(error);
			attachment = new message.client.Discord.MessageAttachment(message.client.config.images.serverError);
		}
		message.channel.send(attachment);
		return message.channel.stopTyping();
	})
};