module.exports = {
	triggers: [
		"seticon"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Change the bots icon (dev only)",
	usage: "<icon url>",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		// extra check, to be safe
		if (!message.client.config.developers.includes(message.author.id)) return message.reply("You cannot run this command as you are not a developer of this bot.");
		message.channel.startTyping();
		if(message.unparsedArgs.length === 0) {
			message.channel.stopTyping();
			return new Error("ERR_INVALID_USAGE");
		}
		let set, attachment;
		set = message.unparsedArgs.join("%20");
		message.client.user.setAvatar(set).then((user) => {
			attachment = new message.client.Discord.MessageAttachment(user.displayAvatarURL());
			message.reply("Set Avatar to (attachment)",attachment);
			return message.channel.stopTyping();
		}).catch((err) => {
			message.channel.send(`There was an error while doing this: ${err}`) ;
			return message.channel.stopTyping();
		});
	})
};