const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"reload"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Reload parts of the bot",
	usage: "[command]",
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
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let cmd = this.getCommand(message.args);
		if(!cmd) return message.channel.createMessage("Invalid command");
		let newcmd = require(cmd.path),
			changes = [];
		Reflect.ownKeys(cmd).forEach((key) => {
			if(["path","category"].includes(key)) return;
			if(!this._.isEqual(cmd[key],newcmd[key]) && cmd[key].toString() !== newcmd[key].toString()) {
				changes.push(key);
				cmd[key] = newcmd[key];
			}
		});
		delete require.cache[require.resolve(cmd.path)];
		if(changes.length === 0) {
			return message.channel.createMessage(`<@!${message.author.id}>, No changes were found to reload.`);
		} else {
			return message.channel.createMessage(`<@!${message.author.id}>, Reloaded **${message.args[0]}**.\nChanges: ${changes.join(", ")}`);
		}
	})
};