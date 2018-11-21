module.exports = (async (self,local) => {
	local.channel.startTyping();
	try {
		var attachment = new self.Discord.MessageAttachment("https://random.birb.pw/tweet/random","random.bird.pw.png");
	}catch(e){
		console.log(e);
		var attachment = new self.Discord.messageAttachment("https://i.imgur.com/p4zFqH3.png");
	}
	local.channel.send(attachment);
	return local.channel.stopTyping();
});