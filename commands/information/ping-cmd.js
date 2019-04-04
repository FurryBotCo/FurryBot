module.exports = {
	triggers: [
		"ping",
		"pong"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: .5e3,
	description: "Get the bots ping",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let m = await message.channel.createMessage("Checking Ping..");
		m.edit("Ping Calculated!");
		m.delete().catch(noerr => null);
		return message.channel.createMessage(`Client Ping: ${(m.timestamp - message.timestamp)}ms${"\n"}Shard Ping: ${Math.round(message.guild.shard.latency)}ms`);
	})
};