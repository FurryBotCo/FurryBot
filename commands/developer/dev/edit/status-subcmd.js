const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"status"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Change the bots status",
	usage: "<status>",
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
		if(message.args.length <= 0) return new Error("ERR_INVALID_USAGE");
		const types = ["online","idle","dnd","invisible"];
		if(!types.includes(message.args[0].toLowerCase())) return message.channel.createMessage(`<@!${message.author.id}>, invalid type. Possible types: **${types.join("**, **")}**.`);
		let game = this.bot.guilds.filter(g => g.members.has(this.bot.user.id))[0].members.get(this.bot.user.id).game;

		try {
			this.bot.editStatus(message.args[0].toLowerCase(),game);
			return message.reply(`set bots status to ${message.args[0].toLowerCase()}`);
		} catch(e) {
			return message.reply(`There was an error while doing this: ${e}`);
		}
	})
};