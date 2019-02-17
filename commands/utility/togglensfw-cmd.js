module.exports = {
	triggers: [
		"togglensfw"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggle NSFW Commands",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
    
		// nsfwModuleEnabled
		switch(message.gConfig.nsfwModuleEnabled) {
		case true:
			message.client.db.updateGuild(message.guild.id, {nsfwModuleEnabled: false});
			message.reply("Disabled NSFW commands.");
			break;
    
		case false:
			message.client.db.updateGuild(message.guild.id, {nsfwModuleEnabled: true});
			message.reply("Enabled NSFW commands.");
			break;
		}
	})
};