module.exports = (async (self,local) => {
    Object.assign(self,local);

    if(self.args.length === 0) {
        self.config.yiff.types.forEach((ytype)=>{
            if(self.channel.name.indexOf(ytype) !== -1) var type = ytype;
        });

        if(!type) {
            var type = self.config.yiff.defaultType;
            if(!self.yiffNoticeViewed.has(self.guild.id)) {
                self.yiffNoticeViewed.add(self.guild.id);
                self.channel.send(`Showing default yiff type **${type}**\nTo change thos, add one of these values somewhere in the channel __name__: **${self.config.yiff.types.join("**, **")}**.`);
            }
        }

    } else {
        var type = self.args.join(" ");
        if(!self.config.yiff.types.includes(type)) {
            var data = {
                title: "Invalid yiff type",
                description: `The type you provided **${type}** is invalid, valid types are: **${self.config.yiff.types.join("**, **")}**.`
            }
            Object.assign(data,self.embed_defaults);
            var embed = new self.Discord.RichEmbed(data);
            return self.channel.send(embed);
        }
    }

    const img = await self.imageAPIRequest(false,`yiff/${type}`,true);
    if(img.success !== true) {
        return self.message.reply(`API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
    }
    var attachment = new self.Discord.MessageAttachment(img.response.image);
    var short = await self.shortenUrl(img.response.image);

    return self.channel.send(`Short URL: <${short.link}>\n\nType: ${type}\n\nRequested By: ${self.author.tag}`,attachment);
});