module.exports = {
	triggers: [
		"delcmds"
	],
	userPermissions: [
		"manageMessages" // 8192
	],
	botPermissions: [
		"manageMessages" // 8192
	],
	cooldown: .75e3,
	description: "Toggle command deletion",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		switch(message.gConfig.deleteCommands) {
		case true:
			await this.mdb.collection("guilds").findOneAndUpdate({
				id: message.channel.guild.id
			},{
				$set: {
					deleteCommands: false
				}
			});
			return message.channel.createMessage(`<@!${message.author.id}>, Disabled deleting command invocations.`);
			break; // eslint-disable-line no-unreachable
		
		case false:
			await this.mdb.collection("guilds").findOneAndUpdate({
				id: message.channel.guild.id
			},{
				$set: {
					deleteCommands: true
				}
			});
			return message.channel.createMessage(`<@!${message.author.id}>, Enabled deleting command invocations.`);
			break; // eslint-disable-line no-unreachable
		}
	})
};