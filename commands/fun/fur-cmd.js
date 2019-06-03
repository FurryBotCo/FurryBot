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
		"fur"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 2e3,
	description: "Get a random fur image! use `fur list	 to get a list of all supported types!",
	usage: "[type]",
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
		const types = [
			"boop",
			"cuddle",
			"fursuit",
			"hold",
			"hug",
			"kiss",
			"lick",
			"propose"
		];
		let ln, type, req, short, extra, jsn;
		if(message.args.length === 0 ) {
			ln = Math.floor(Math.random()*(types.length));
			// 0 (1) - 25: Inkbunny
			type = types[Math.floor(ln/25)];
		} else {
			type = message.args[0].toLowerCase();
			if(type === "list") return message.channel.createMessage(`<@!${message.author.id}>, Valid Values:\n**${types.join("**\n**")}**.`);
		}
		try {
			if(!type) type = "hug";
			req = await functions.imageAPIRequest(false,type,true,true);
			short = await this.shortenUrl(req.response.image);
			extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
			return message.channel.createMessage(`${extra}Short URL: <${short.link}>\nRequested By: ${message.author.username}#${message.author.discriminator}\nType: ${this.ucwords(type)}`,{
				file: await functions.getImageFromURL(req.response.image),
				name: req.response.name
			});
		}catch(error){
			this.logger.error(`Error:\n${error}`);
			this.logger.log(`Body: ${jsn}`);
			return message.channel.createMessage("Unknown API Error",{
				file: await functions.getImageFromURL("https://fb.furcdn.net/NotFound.png"),
				name: "NotFound.png"
			});
		}
			
	})
};