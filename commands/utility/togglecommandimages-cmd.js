module.exports = {
	triggers: [
		"toggleimages",
		"togglecommandimages"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggle images on fun commands",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
    
		switch(message.gConfig.commandImages) {
		case true:
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					commandImages: false
				}
			});
			message.channel.createMessage("Disabled command images.");
			break;
    
		case false:
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					commandImages: true
				}
			});
			message.channel.createMessage("Enabled command images.");
			break;
		}
	})
};