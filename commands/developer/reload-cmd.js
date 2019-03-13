module.exports = {
	triggers: [
		"reload"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Reload parts of the bot",
	usage: "[command]",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		// extra check, to be safe
		if (!this.config.developers.includes(message.author.id)) return message.reply("You cannot run this command as you are not a developer of this bot.");
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		if(!this.commandList.includes(message.args[0])) return message.reply("Invalid command");
		let cmd = this.getCommand(message.args[0]),
			newcmd = require(cmd.path),
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
			return message.reply("No changes were found to reload.");
		} else {
			return message.reply(`Reloaded **${message.args[0]}**.\nChanges: ${changes.join(", ")}`);
		}
	})
};