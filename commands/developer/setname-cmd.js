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
    run: (async(client,message) => {
        message.channel.startTyping();
        if(message.args.length < 1) {
            message.channel.stopTyping();
            return new Error("ERR_INVALID_USAGE");
        }
        var set = message.args.join("");
        if(set.length < 2 || set.length > 32) {
            message.reply(`Username must be between **2** and **32** characters.`);
            return message.channel.stopTyping();
        }
        client.user.setUsername(set).then((user) => {
            message.reply(`Set username to: ${user.username}`);
            return message.channel.stopTyping();
        }).catch((err) => {
           message.channel.send(`There was an error while doing this: ${err}`) ;
           return message.channel.stopTyping();
        })
    })
};