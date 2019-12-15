import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../../config";
import { Logger } from "clustersv2";
import { db, mdb } from "../../../../modules/Database";
import Eris from "eris";

export default new SubCommand({
	triggers: [
		"guild",
		"g",
		"server",
		"s"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Check if a serer is blacklisted.",
	usage: "<id>",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const id = msg.args[0];
	if (id.length < 17 || id.length > 18) return msg.reply(`**${id}** isn't a valid server id.`);
	const srv = await db.getGuild(id);
	if (!srv) return msg.reply(`Failed to fetch guild entry for **${id}**`);

	if (typeof srv.blacklist === "undefined") await srv.edit({ blacklist: { blacklisted: false, reason: null, blame: null } }).then(d => d.reload());
	if (srv.blacklist.blacklisted) return msg.reply(`**${id}** is blacklisted, reason: ${srv.blacklist.reason}.`);
	else return msg.reply(`**${id}** is not blacklisted.`);
}));
