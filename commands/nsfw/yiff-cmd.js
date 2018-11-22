module.exports = (async (self,local) => {
    local.channel.startTyping();
    var extra = "";
    if(local.args.length === 0) {
        self.config.yiff.types.forEach((ytype)=>{
            if(local.channel.name.indexOf(ytype) !== -1) var type = ytype;
        });

        if(!type) {
            var type = self.config.yiff.defaultType;
            if(!self.yiffNoticeViewed.has(local.guild.id)) {
                self.yiffNoticeViewed.add(local.guild.id);
                extra+=`Showing default yiff type **${type}**\nTo change this, add one of these values somewhere in the channel __name__: **${self.config.yiff.types.join("**, **")}**.\n\n`;
            }
        }

    } else {
        var type = local.args.join(" ");
        if(!self.config.yiff.types.includes(type)) {
            var data = {
                title: "Invalid yiff type",
                description: `The type you provided **${type}** is invalid, valid types are: **${self.config.yiff.types.join("**, **")}**.`
            }
            Object.assign(data,self.embed_defaults());
            var embed = new self.Discord.RichEmbed(data);
            return local.channel.send(embed);
        }
    }

    const img = await self.imageAPIRequest(false,`yiff/${type}`,true);
    if(img.success !== true) {
        return local.message.reply(`API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
    }
    var attachment = new self.Discord.MessageAttachment(img.response.image);
    var short = await self.shortenUrl(img.response.image);
    extra+= short.new ? `**This is the first time this has been viewed! Image #${short.imageNumber}**\n\n` : "";
    local.channel.send(`${extra}Short URL: <${short.link}>\n\nType: ${type}\n\nRequested By: ${local.author.tag}`,attachment);
    return local.channel.stopTyping();
});