module.exports = {
	triggers: ["leaveserver","leave"],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Make the bot leave a server (dev only)",
	usage: "[server id]",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
    guildOwnerOnly: false,
    run: (async(self,local) => {
        local.channel.startTyping();
        if(local.args.length < 1) {
            local.channel.stopTyping();
            return new Error("ERR_INVALID_USAGE");
        }
        if(!self.guilds.has(local.args[0])) {
            local.message.reply("Guild not found");
            return local.channel.stopTyping();
        }
        self.guilds.get(local.args[0]).leave().then((guild) => {
            local.message.reply(`Left guild **${guild.name}** (${guild.id})`);
            return local.channel.stopTyping();
        }).catch((err) => {
            local.channel.send(`There was an error while doing this: ${err}`) ;
            return local.channel.stopTyping();
         })
    })
};