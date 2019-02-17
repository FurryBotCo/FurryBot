module.exports = {
	triggers: [
		"whatismyprefix"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	run: (async (client,message) => {
		return message.reply(`this guilds prefix is **${message.gConfig.prefix}** ${client.config.beta?`(overridden to \`${client.config.defaultPrefix}\` on beta bot)`:""}`);
	})
};