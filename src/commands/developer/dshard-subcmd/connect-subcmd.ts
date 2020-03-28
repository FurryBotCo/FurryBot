import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import ExtendedMessage from "@ExtendedMessage";

export default new SubCommand({
	triggers: [
		"connect"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Connect a shard.",
	usage: "<id>",
	features: ["devOnly"],
	file: __filename
}, (async function (msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	const s = Number(msg.args[0]);
	if (!this.shards.has(s)) return msg.reply(`invalid shard id "${s}".`);

	this.shards.get(s).connect();
	return msg.reply(`connected shard **#${s}**.`);
}));
