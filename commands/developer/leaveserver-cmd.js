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
    run: (async(client,message) => {
        message.channel.startTyping();
        if(message.args.length < 1) {
            message.channel.stopTyping();
            return new Error("ERR_INVALID_USAGE");
        }
        if(!client.guilds.has(message.args[0])) {
            message.reply("Guild not found");
            return message.channel.stopTyping();
        }
        client.guilds.get(message.args[0]).leave().then((guild) => {
            message.reply(`Left guild **${guild.name}** (${guild.id})`);
            return message.channel.stopTyping();
        }).catch((err) => {
            message.channel.send(`There was an error while doing this: ${err}`) ;
            return message.channel.stopTyping();
         })
    })
};