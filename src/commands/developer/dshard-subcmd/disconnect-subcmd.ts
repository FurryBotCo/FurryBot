import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import ExtendedMessage from "@ExtendedMessage";

export default new SubCommand({
	triggers: [
		"disconnect"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Disconnect a shard.",
	usage: "<id> [reconnect]",
	features: ["contribOnly"],
	file: __filename
}, (async function (msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	const s = Number(msg.args[0]);
	if (!this.shards.has(s)) return msg.reply(`invalid shard id "${s}".`);

	this.shards.get(s).disconnect({ reconnect: !!msg.args[1] });
	return msg.reply(`disconnected shard **#${s}**. ${!!msg.args[1] ? "Automatically reconnecting." : "Not reconnecting."}`);
}));
