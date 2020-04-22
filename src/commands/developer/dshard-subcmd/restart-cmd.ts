import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import ExtendedMessage from "@ExtendedMessage";

export default new SubCommand({
	triggers: [
		"restart"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Restart a shard.",
	usage: "<id>",
	features: ["contribOnly"],
	file: __filename
}, (async function (msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	const s = Number(msg.args[0]);
	if (!this.shards.has(s)) return msg.reply(`invalid shard id "${s}".`);

	this.shards.get(s).disconnect();
	return msg
		.reply(`restarting shard **#${s}**.`)
		.then(() =>
			this.shards.get(s).connect()
		);
}));
