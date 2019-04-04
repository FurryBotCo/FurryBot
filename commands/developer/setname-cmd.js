module.exports = {
	triggers: [
		"setname"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Change the bots username (dev only)",
	usage: "<username>",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		// extra check, to be safe
		if (!this.config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer of this bot.`);
		if(message.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
		let set;
		set = message.unparsedArgs.join(" ");
		if(set.length < 2 || set.length > 32) return message.channel.createMessage("Username must be between **2** and **32** characters.");
		this.bot.editSelf({username: set})
			.then((user) => message.channel.createMessage(`<@!${message.author.id}>, Set username to: ${user.username}`))
			.catch((err) => message.channel.createMessage(`There was an error while doing this: ${err}`));
	})
};