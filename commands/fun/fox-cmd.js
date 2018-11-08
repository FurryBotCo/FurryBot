module.exports=(async (self) => {
	var attachment = new self.MessageAttachment("https://foxrudor.de/","foxrudor.de.png");
	return self.channel.send(attachment);
});