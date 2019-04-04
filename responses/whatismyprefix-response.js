module.exports = {
	triggers: [
		"whatismyprefix"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	run: (async (message) => message.channel.createMessage(`<@!${message.author.id}>, This guilds prefix is **${message.gConfig.prefix}**\nThis can be changed by running \`${message.gConfig.prefix}prefix <new prefix>\``))
};