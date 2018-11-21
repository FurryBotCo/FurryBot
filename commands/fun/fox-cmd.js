module.exports = (async (self,local) => {
	local.channel.startTyping();
	var attachment = new self.Discord.MessageAttachment("https://foxrudor.de/","foxrudor.de.png");
	local.channel.send(attachment);
	return local.channel.stopTyping();
});