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
    run: (async(client,message )=> {
		// extra check, to be safe
		if (!client.config.developers.includes(message.author.id)) {
			return message.reply("You cannot run this command as you are not a developer of this bot.");
		}
        message.channel.startTyping();
        if(message.unparsedArgs.length < 1) {
            message.channel.stopTyping();
            return new Error("ERR_INVALID_USAGE");
        }
        var set = message.unparsedArgs.join("%20");
        client.user.setAvatar(set).then((user) => {
            var attachment = new client.Discord.MessageAttachment(user.displayAvatarURL());
            message.reply(`Set Avatar to (attachment)`,attachment);
            return message.channel.stopTyping();
        }).catch((err) => {
           message.channel.send(`There was an error while doing this: ${err}`) ;
           return message.channel.stopTyping();
        })
    })
};