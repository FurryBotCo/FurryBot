module.exports = (async (self) => {
	var attachment = new self.MessageAttachment("https://random.birb.pw/tweet/random","random.bird.pw.png");
	return self.channel.send(attachment);
});