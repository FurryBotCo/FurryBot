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
	run: (async function(message) {
    
		switch(message.gConfig.fResponseEnabled) {
		case true:
			this.db.updateGuild(message.guild.id, {fResponseEnabled: false});
			message.reply("Disabled f response.");
			break;
    
		case false:
			this.db.updateGuild(message.guild.id, {fResponseEnabled: true});
			message.reply("Enabled f response.");
			break;
		}
	})
};