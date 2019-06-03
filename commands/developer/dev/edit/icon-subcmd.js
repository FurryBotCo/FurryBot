const {
	config,
	functions,
	phin,
	request,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"icon"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 0,
	description: "Change the bots icon (dev only)",
	usage: "<icon url>",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		// extra check, to be safe
		if (!config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer of this bot.`);
		if(message.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
		let set = await request(message.unparsedArgs.join("%20"),{encoding:null}).then(res => `data:${res.headers["content-type"]};base64,${res.body.toString("base64")}`);
		this.bot.editSelf({avatar: set})
			.then(async(user) => message.channel.createMessage(`<@!${message.author.id}>, Set Avatar to (attachment)`,{
				file: await functions.getImageFromURL(user.avatarURL),
				name: "avatar.png"
			}))
			.catch((err) => message.channel.createMessage(`There was an error while doing this: ${err}`));
	})
};