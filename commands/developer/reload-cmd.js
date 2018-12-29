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
	run: (async (client,message) => {
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		if(!client.commandList.includes(message.args[0])) return message.reply("Invalid command");
		var cmd = client.getCommand(message.args[0]);
		var newcmd = require(cmd.path);
		var changes = [];
		Reflect.ownKeys(cmd).forEach((key)=>{
			if(["path","category"].includes(key)) return;
			if(!client._.isEqual(cmd[key],newcmd[key]) && cmd[key].toString() !== newcmd[key].toString()) {
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