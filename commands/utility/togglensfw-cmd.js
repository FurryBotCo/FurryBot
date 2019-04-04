module.exports = {
	triggers: [
		"togglensfw"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggle NSFW Commands",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
    
		// nsfwModuleEnabled
		switch(message.gConfig.nsfwModuleEnabled) {
		case true:
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					nsfwModuleEnabled: false
				}
			});
			message.channel.createMessage("Disabled NSFW commands.");
			break;
    
		case false:
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					nsfwModuleEnabled: true
				}
			});
			message.channel.createMessage("Enabled NSFW commands.");
			break;
		}
	})
};