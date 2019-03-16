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
	run: (async function(message) {
		message.channel.startTyping();
		let extra, type, data, embed, attachment, short;
		extra = "";
		if(message.args.length === 0) {
			for(let ytype of this.config.yiff.types) {
				if(message.channel.name.indexOf(ytype) !== -1) type = ytype;
			}
    
			if(!type) {
				type = this.config.yiff.defaultType;
				if(!this.yiffNoticeViewed.has(message.guild.id)) {
					this.yiffNoticeViewed.add(message.guild.id);
					extra+=`Showing default yiff type **${type}**\nTo change this, add one of these values somewhere in the channel __name__: **${this.config.yiff.types.join("**, **")}**.\n\n`;
				}
			}
    
		} else {
			type = message.args.join(" ");
			if(!this.config.yiff.types.includes(type)) {
				data = {
					title: "Invalid yiff type",
					description: `The type you provided **${type}** is invalid, valid types are: **${this.config.yiff.types.join("**, **")}**.`
				};
				Object.assign(data,message.embed_defaults());
				embed = new this.Discord.MessageEmbed(data);
				return message.channel.send(embed);
			}
		}
    
		const img = await this.imageAPIRequest(false,`yiff/${type}`,true,false);
		if(img.success !== true) {
			return message.reply(`API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
		}
		attachment = new this.Discord.MessageAttachment(img.response.image);
		short = await this.shortenUrl(img.response.image);
		extra+= short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
		message.channel.send(`${extra}Short URL: <${short.link}>\n\nType: ${type}\n\nRequested By: ${message.author.tag}`,attachment);
		return message.channel.stopTyping();
	})
};