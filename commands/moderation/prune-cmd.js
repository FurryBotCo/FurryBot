module.exports = {
	triggers: [
		"prune",
		"purge",
		"clear"
	],
	userPermissions: [
		"manageMessages" // 8192
	],
	botPermissions: [
		"manageMessages" // 8192
	],
	cooldown: .5e3,
	description: "Clear messages in a channel",
	usage: "<2-100>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length === 0 || isNaN(message.args[0])) return new Error("ERR_INVALID_USAGE");
		if(message.args[0] < 2 || message.args[0] > 100) return message.channel.createMessage(`<@!${message.author.id}>, Please provide a number between 2`);
		if(message.args[0] < 100) message.args[0]++;

		const m = await message.channel.getMessages(message.args[0]);
		return message.channel.deleteMessages(m.map(j => j.id));
	})
};