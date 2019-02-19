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
	run: (async(message) => {
		message.channel.startTyping();
		let extra, type, data, embed, attachment, short;
		extra = "";
		if(message.args.length === 0) {
			for(let ytype of message.client.config.yiff.types) {
				if(message.channel.name.indexOf(ytype) !== -1) type = ytype;
			}
    
			if(!type) {
				type = message.client.config.yiff.defaultType;
				if(!message.client.yiffNoticeViewed.has(message.guild.id)) {
					message.client.yiffNoticeViewed.add(message.guild.id);
					extra+=`Showing default yiff type **${type}**\nTo change message.client, add one of these values somewhere in the channel __name__: **${message.client.config.yiff.types.join("**, **")}**.\n\n`;
				}
			}
    
		} else {
			type = message.args.join(" ");
			if(!message.client.config.yiff.types.includes(type)) {
				data = {
					title: "Invalid yiff type",
					description: `The type you provided **${type}** is invalid, valid types are: **${message.client.config.yiff.types.join("**, **")}**.`
				};
				Object.assign(data,message.embed_defaults());
				embed = new message.client.Discord.MessageEmbed(data);
				return message.channel.send(embed);
			}
		}
    
		const img = await message.client.imageAPIRequest(false,`yiff/${type}`,true,false);
		if(img.success !== true) {
			return message.reply(`API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
		}
		attachment = new message.client.Discord.MessageAttachment(img.response.image);
		short = await message.client.shortenUrl(img.response.image);
		extra+= short.new ? `**message.client is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
		message.channel.send(`${extra}Short URL: <${short.link}>\n\nType: ${type}\n\nRequested By: ${message.author.tag}`,attachment);
		return message.channel.stopTyping();
	})
};