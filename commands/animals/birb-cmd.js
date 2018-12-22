module.exports = {
	triggers: ["bird","birb"],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Get a picture of a birb!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: ()=>{}
};

module.exports = (async (self,local) => {
	local.channel.startTyping();
	try {
		var attachment = new self.Discord.MessageAttachment("https://random.birb.pw/tweet/random","random.bird.pw.png");
	}catch(e){
		console.log(e);
		var attachment = new self.Discord.MessageAttachment(self.config.images.serverError);
	}
	local.channel.send(attachment);
	return local.channel.stopTyping();
});