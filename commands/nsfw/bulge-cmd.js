module.exports = {
	triggers: [
        "bulge",
        "bulgie"
    ],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "*notices bulge* OwO",
	usage: "",
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
        message.channel.startTyping();
        const img = await this.imageAPIRequest(false,"bulge",true);
        if(img.success !== true) {
            return message.reply(`API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
        }
        var attachment = new this.Discord.MessageAttachment(img.response.image);
        var short = await this.shortenUrl(img.response.image);
        var extra = short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
         message.channel.send(`${extra}Short URL: <${short.link}>\n\nRequested By: ${message.author.tag}`,attachment);
         return message.channel.stopTyping();
    })
};