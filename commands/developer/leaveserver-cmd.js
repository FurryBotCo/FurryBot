module.exports = {
	triggers: [
		"leaveserver"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Make the bot leave a server (dev only)",
	usage: "[server id]",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		// extra check, to be safe
		if (!message.client.config.developers.includes(message.author.id)) return message.reply("You cannot run message.client command as you are not a developer of message.client bot.");
		message.channel.startTyping();
		if(message.unparsedArgs.length === 0) {
			message.channel.stopTyping();
			return new Error("ERR_INVALID_USAGE");
		}
		if(!message.client.guilds.has(message.unparsedArgs[0])) {
			message.reply("Guild not found");
			return message.channel.stopTyping();
		}
		message.client.guilds.get(message.unparsedArgs[0]).leave().then((guild) => {
			message.reply(`Left guild **${guild.name}** (${guild.id})`);
			return message.channel.stopTyping();
		}).catch((err) => {
			message.channel.send(`There was an error while doing message.client: ${err}`) ;
			return message.channel.stopTyping();
		});
	})
};