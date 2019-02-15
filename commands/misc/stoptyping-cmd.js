module.exports = {
	triggers: [
		"stoptyping"
	],
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
	run: (async function(message) {
		var channel = message.mentions.channels.first() ? message.mentions.channels.first() : message.channel;
		if(!channel.typing) return message.reply("I don't seem to be typing here..?");
		message.reply("I've sent a command to stop typing, let's see if this works!");
		return channel.stopTyping();
	})
};