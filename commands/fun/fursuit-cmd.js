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
		"fursuit"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 2e3,
	description: "Get a random fursuit image!",
	usage: "",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let img, short, extra;
		img = await functions.imageAPIRequest(false,"fursuit",true,true);
		if(img.success !== true) return message.channel.createMessage(`<@!${message.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
		short = await this.shortenUrl(img.response.image);
		extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
		message.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nRequested By: ${message.author.username}#${message.author.discriminator}`,{
			file: await functions.getImageFromURL(img.response.image),
			name: img.response.name
		});
	})
};