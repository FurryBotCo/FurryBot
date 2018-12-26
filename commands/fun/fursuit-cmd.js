module.exports = {
	triggers: [
        "fursuit"
    ],
	userPermissions: [],
	botPermissions: [
        "ATTACH_FILES"
    ],
	cooldown: 2e3,
	description: "Get a random fursuit image!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
        message.channel.startTyping();
        const img = await client.imageAPIRequest(true,"fursuit",true);
        if(img.success !== true) {
            return message.reply(`API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
        }
        var attachment = new client.Discord.MessageAttachment(img.response.image);
        var short = await client.shortenUrl(img.response.image);
        var extra = short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
        message.channel.send(`${extra}Short URL: <${short.link}>\n\nRequested By: ${message.author.tag}`,attachment);
        return message.channel.stopTyping();
    })
};