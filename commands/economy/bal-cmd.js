module.exports = {
	triggers: ["bal","money"],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3,
	description: "Check your economy balance",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	run: (async (self,local) => {
		local.channel.startTyping();
		local.message.reply(`Your balance is ${self.uConfig.bal}.`);
		return local.channel.stopTyping();
	})
};