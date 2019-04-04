module.exports = {
	triggers: [
		"bulge",
		"bulgie"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768s
	],
	cooldown: 3e3,
	description: "*notices bulge* OwO",
	usage: "",
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let img, short, extra;
		img = await this.imageAPIRequest(false,"bulge",true,false);
		if(img.success !== true) {
			this.logger.error(img);
			return message.channel.createMessage(`<@!${message.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
		}
		short = await this.shortenUrl(img.response.image);
		extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
		return message.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nRequested By: ${message.author.username}#${message.author.discriminator}`,{
			file: await this.getImageFromURL(img.response.image),
			name: img.response.name
		});
	})
};