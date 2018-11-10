module.exports = (async (self,local) => {
	Object.assign(self,local);
	var attachment = new self.Discord.MessageAttachment("https://random.birb.pw/tweet/random","random.bird.pw.png");
	return self.channel.send(attachment);
});