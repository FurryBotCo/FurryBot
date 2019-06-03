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
		"bap"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Bap someone! Ouch!",
	usage: "<@member/text>",
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
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let input, text;
		input = message.args.join(" ");
		text = this.varParse(message.c,{author:message.author,input:input});
		if(message.gConfig.commandImages) {
			if(!message.channel.permissionsOf(this.bot.user.id).has("attachFiles") /* 32768 */) return message.channel.createMessage(`<@!${message.author.id}>, Hey, I require the \`ATTACH_FILES\` permission for images to work on these commands!`);
			message.channel.createMessage(text,{
				file: await functions.getImageFromURL("https://assets.furry.bot/bap.gif"),
				name: "bap.gif"
			});
		} else {
			message.channel.createMessage(text);
		}
	})
};