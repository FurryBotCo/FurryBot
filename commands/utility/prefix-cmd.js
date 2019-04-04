module.exports = {
	triggers: [
		"prefix",
		"setprefix"
	],
	userPermissions: [
		"manageGuild" // 32
	],
	botPermissions: [],
	cooldown: 3e3,
	description: "Change the bots prefix for this guild (server)",
	usage: "<new prefix>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		if(message.args[0].length === 0 || message.args[0].length > 30) return message.channel.createMessage("Prefix must be between 1 and 30 characters.");
		await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
			$set: {
				prefix: message.args[0].toLowerCase()
			}
		});
		return message.channel.createMessage(`Set this guilds prefix to ${message.args[0].toLowerCase()}, you can view the current prefix at any time by typing \`whatismyprefix\`, or mentioning me!`);
	})
};