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
		if (!this.config.developers.includes(message.author.id)) return message.reply("You cannot run this command as you are not a developer of this bot.");
		message.channel.startTyping();
		if(message.unparsedArgs.length === 0) {
			message.channel.stopTyping();
			return new Error("ERR_INVALID_USAGE");
		}
		let set;
		set = message.unparsedArgs.join(" ");
		if(set.length < 2 || set.length > 32) {
			message.reply("Username must be between **2** and **32** characters.");
			return message.channel.stopTyping();
		}
		this.user.setUsername(set).then((user) => {
			message.reply(`Set username to: ${user.username}`);
			return message.channel.stopTyping();
		}).catch((err) => {
			message.channel.send(`There was an error while doing this: ${err}`) ;
			return message.channel.stopTyping();
		});
	})
};