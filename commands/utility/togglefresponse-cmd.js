module.exports = {
	triggers: [
		"togglefresponse",
		"togglef",
		"togglerip",
		"toggleripresponse"
	],
	userPermissions: [
		"manageGuild"
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
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					fResponseEnabled: false
				}
			});
			message.channel.createMessage("Disabled f response.");
			break;
    
		case false:
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					fResponseEnabled: true
				}
			});
			message.channel.createMessage("Enabled f response.");
			break;
		}
	})
};