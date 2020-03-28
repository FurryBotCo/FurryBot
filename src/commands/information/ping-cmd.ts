import Command from "../../util/CommandHandler/lib/Command";

export default new Command({
	triggers: [
		"ping"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 1e3,
	donatorCooldown: .5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.channel.createMessage("{lang:commands.information.ping.check}")
		.then(m => m.edit("{lang:commands.information.ping.calc}"))
		.then(async (m) => {
			await msg.channel.createMessage(`{lang:commands.information.ping.client}: ${Number(m.timestamp - msg.timestamp).toLocaleString()}ms${"\n"}{lang:commands.information.ping.shard}: ${Number(msg.channel.guild.shard.latency).toLocaleString()}ms`);
			return m.delete();
		});
}));
