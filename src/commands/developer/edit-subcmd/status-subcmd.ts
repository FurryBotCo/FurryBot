import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import Eris from "eris";

export default new SubCommand({
	triggers: [
		"status"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Change the bots status.",
	usage: "<status>",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length <= 0) return new Error("ERR_INVALID_USAGE");
	const types: Eris.Status[] = ["online", "idle", "dnd", "offline"];
	if (!types.includes(msg.args[0].toLowerCase() as Eris.Status)) return msg.reply(`invalid type. Valid types: **${types.join("**, **")}**.`);

	try {
		this.editStatus(msg.args[0].toLowerCase() as Eris.Status, msg.channel.guild.shard.presence.game);
		return msg.reply(`set bots status to ${msg.args[0].toLowerCase()}`);
	} catch (e) {
		return msg.reply(`There was an error while doing this: ${e}`);
	}
}));
