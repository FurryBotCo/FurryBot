module.exports = {
	triggers: [
		"reload"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Reload parts of the bot",
	usage: "[command]",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		// extra check, to be safe
		if (!this.config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer of this bot.`);
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