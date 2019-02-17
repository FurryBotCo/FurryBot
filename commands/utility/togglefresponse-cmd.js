module.exports = {
	triggers: [
		"togglefresponse",
		"togglef",
		"togglerip",
		"toggleripresponse"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggles the \"f\" and \"rip\" responses",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
    
		switch(message.gConfig.fResponseEnabled) {
		case true:
			message.client.db.updateGuild(message.guild.id, {fResponseEnabled: false});
			message.reply("Disabled f response.");
			break;
    
		case false:
			message.client.db.updateGuild(message.guild.id, {fResponseEnabled: true});
			message.reply("Enabled f response.");
			break;
		}
	})
};