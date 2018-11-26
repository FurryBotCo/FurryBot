module.exports = (async (self,local) => {
    local.channel.startTyping();
    const img = await self.imageAPIRequest(false,"bulge",true);
    if(img.success !== true) {
        return local.message.reply(`API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
    }
    var attachment = new self.Discord.MessageAttachment(img.response.image);
    var short = await self.shortenUrl(img.response.image);
    var extra = short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
     local.channel.send(`${extra}Short URL: <${short.link}>\n\nRequested By: ${local.author.tag}`,attachment);
     return local.channel.stopTyping();
});