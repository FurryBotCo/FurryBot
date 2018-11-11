module.exports = (async (self,local) => {
    Object.assign(self,local);
    const img = await self.imageAPIRequest(false,"bulge",true);
    if(img.success !== true) {
        return self.message.reply(`API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
    }
    var attachment = new self.Discord.MessageAttachment(img.response.image);
    var short = await self.shortenUrl(img.response.image);

    return self.channel.send(`Short URL: <${short.link}>\n\nRequested By: ${self.author.tag}`,attachment);
});