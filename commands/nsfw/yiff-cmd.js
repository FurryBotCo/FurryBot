module.exports = {
	triggers: [
		"yiff"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "Get some yiff!",
	usage: "[gay/straight]",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		
		let extra, type, embed, short;
		extra = "";
		if(message.args.length === 0) {
			for(let ytype of this.config.yiff.types) {
				if(message.channel.name.indexOf(ytype) !== -1) type = ytype;
			}
    
			if(!type) {
				type = this.config.yiff.defaultType;
				if(!this.yiffNoticeViewed.has(message.channel.guild.id)) {
					this.yiffNoticeViewed.add(message.channel.guild.id);
					extra += `Showing default yiff type **${type}**\nTo change this, add one of these values somewhere in the channel __name__: **${this.config.yiff.types.join("**, **")}**.\n\n`;
				}
			}
    
		} else {
			type = message.args.join(" ");
			if(!this.config.yiff.types.includes(type)) {
				embed = {
					title: "Invalid yiff type",
					description: `The type you provided **${type}** is invalid, valid types are: **${this.config.yiff.types.join("**, **")}**.`
				};
				Object.assign(embed,message.embed_defaults());
				return message.channel.createMessage({ embed });
			}
		}
    
		const img = await this.imageAPIRequest(false,`yiff/${type}`,true,false);
		if(img.success !== true) {
			return message.channel.createMessage(`<@!${message.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
		}
		short = await this.shortenUrl(img.response.image);
		extra+= short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
		return message.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nType: ${type}\n\nRequested By: ${message.author.username}#${message.author.discriminator}`,{
			file: await this.getImageFromURL(img.response.image),
			name: img.response.name
		});
	})
};