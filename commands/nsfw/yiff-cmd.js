const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

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
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		
		let extra, type, embed, short;
		extra = "";
		if(message.args.length === 0) {
			for(let ytype of config.yiff.types) {
				if(message.channel.name.indexOf(ytype) !== -1) type = ytype;
			}
    
			if(!type) {
				type = config.yiff.defaultType;
				if(!this.yiffNoticeViewed.has(message.channel.guild.id)) {
					this.yiffNoticeViewed.add(message.channel.guild.id);
					extra += `Showing default yiff type **${type}**\nTo change this, add one of these values somewhere in the channel __name__: **${config.yiff.types.join("**, **")}**.\n\n`;
				}
			}
    
		} else {
			type = message.args.join(" ");
			if(!config.yiff.types.includes(type)) {
				embed = {
					title: "Invalid yiff type",
					description: `The type you provided **${type}** is invalid, valid types are: **${config.yiff.types.join("**, **")}**.`
				};
				Object.assign(embed,message.embed_defaults());
				return message.channel.createMessage({ embed });
			}
		}
    
		const img = await functions.imageAPIRequest(false,`yiff/${type}`,true,false);
		if(img.success !== true) {
			return message.channel.createMessage(`<@!${message.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
		}
		short = await this.shortenUrl(img.response.image);
		extra+= short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
		return message.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nType: ${type}\n\nRequested By: ${message.author.username}#${message.author.discriminator}`,{
			file: await functions.getImageFromURL(img.response.image),
			name: img.response.name
		});
	})
};