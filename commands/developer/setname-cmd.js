module.exports = {
	triggers: ["setname"],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Change the bots username (dev only)",
	usage: "<username>",
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
        var set = local.args.join("");
        if(set.length < 2 || set.length > 32) {
            local.message.reply(`Username must be between **2** and **32** characters.`);
            return local.channel.stopTyping();
        }
        self.user.setUsername(set).then((user) => {
            local.message.reply(`Set username to: ${user.username}`);
            return local.channel.stopTyping();
        }).catch((err) => {
           local.channel.send(`There was an error while doing this: ${err}`) ;
           return local.channel.stopTyping();
        })
    })
};