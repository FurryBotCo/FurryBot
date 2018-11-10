module.exports = (async (self,local) => {
	Object.assign(self,local);
	var attachment = new self.Discord.MessageAttachment("https://foxrudor.de/","foxrudor.de.png");
	return self.channel.send(attachment);
});