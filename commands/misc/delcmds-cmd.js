module.exports = {
	triggers: [
		"delcmds"
	],
	userPermissions: [
		"MANAGE_MESSAGES"
	],
	botPermissions: [
		"MANAGE_MESSAGES"
	],
	cooldown: .75e3,
	description: "Toggle command deletion",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
    
		switch(message.gConfig.deleteCommands) {
		case true:
			message.client.db.updateGuild(message.guild.id, {deleteCommands: false});
			message.reply("Disabled deleting command invocations.");
			break;
    
		case false:
			message.client.db.updateGuild(message.guild.id, {deleteCommands: true});
			message.reply("Enabled deleting command invocations.");
			break;
		}
	})
};