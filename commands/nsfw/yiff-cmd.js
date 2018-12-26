module.exports = {
	triggers: [
        "yiff"
    ],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Get some yiff!",
	usage: "[gay/straight]",
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
        message.channel.startTyping();
        var extra = "";
        if(message.args.length === 0) {
            for(let ytype in client.config.yiff.types) {
                if(message.channel.name.indexOf(ytype) !== -1) var type = ytype;
            }
    
            if(!type) {
                var type = client.config.yiff.defaultType;
                if(!client.yiffNoticeViewed.has(message.guild.id)) {
                    client.yiffNoticeViewed.add(message.guild.id);
                    extra+=`Showing default yiff type **${type}**\nTo change this, add one of these values somewhere in the channel __name__: **${client.config.yiff.types.join("**, **")}**.\n\n`;
                }
            }
    
        } else {
            var type = message.args.join(" ");
            if(!client.config.yiff.types.includes(type)) {
                var data = {
                    title: "Invalid yiff type",
                    description: `The type you provided **${type}** is invalid, valid types are: **${client.config.yiff.types.join("**, **")}**.`
                }
                Object.assign(data,message.embed_defaults());
                var embed = new client.Discord.RichEmbed(data);
                return message.channel.send(embed);
            }
        }
    
        const img = await client.imageAPIRequest(false,`yiff/${type}`,true);
        if(img.success !== true) {
            return message.reply(`API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
        }
        var attachment = new client.Discord.MessageAttachment(img.response.image);
        var short = await client.shortenUrl(img.response.image);
        extra+= short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
        message.channel.send(`${extra}Short URL: <${short.link}>\n\nType: ${type}\n\nRequested By: ${message.author.tag}`,attachment);
        return message.channel.stopTyping();
    })
};