import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import { Colors } from "../../../util/Constants";
import { Time } from "../../../util/Functions";

export default new SubCommand({
	triggers: [
		"status"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Get a shard's status.",
	usage: "<id>",
	features: ["helperOnly"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	// @TODO clusters
	const s = Number(msg.args[0]);
	if (!this.shards.has(s)) return msg.reply(`invalid shard id "${s}".`);

	const shard = this.shards.get(s);

	return msg.channel.createMessage({
		embed: {
			color: shard.status === "ready" ? Colors.green : shard.status === "connecting" ? Colors.orange : Colors.red,
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			description: [
				`Status: ${shard.status}`,
				`Ping: ${shard.latency}ms`,
				`Guilds: ${this.guilds.filter(g => g.shard.id === s).length}`,
				`Last Heartbeat Recieved: ${await Time.ms(Math.round((Date.now() - shard.lastHeartbeatReceived) / 1000) * 1000, true)} ago`,
				`Last Heartbeat Sent: ${await Time.ms(Math.round((Date.now() - shard.lastHeartbeatSent) / 1000) * 1000, true)} ago`
			].join("\n")
		}
	});
}));
