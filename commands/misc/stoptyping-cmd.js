module.exports = {
	triggers: ["stoptyping"],
	userPermissions: [
        "MANAGE_MESSAGES"
    ],
	botPermissions: [],
	cooldown: 1e3,
	description: "Use this if the bot won't stop typing in a channel",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: ()=>{}
};

module.exports = (async(self,local)=>{
    var channel = local.message.mentions.channels.first() ? local.message.mentions.channels.first() : local.channel;
    if(!channel.typing) return local.message.reply("I don't seem to be typing here..?");
    local.message.reply("I've sent a command to stop typing, let's see if this works!");
    return channel.stopTyping();
})