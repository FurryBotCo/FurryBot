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
	run: (async (client,message) => {
		return message.reply("Sorry, the api we used was shutdown, so this is temporarily disabled!");
		/*message.channel.startTyping();
		try {
			var attachment = new client.Discord.MessageAttachment("https://random.birb.pw/tweet/random","random.bird.pw.png");
		}catch(e){
			console.log(e);
			var attachment = new client.Discord.MessageAttachment(client.config.images.serverError);
		}
		message.channel.send(attachment);
		return message.channel.stopTyping();*/
	})
};