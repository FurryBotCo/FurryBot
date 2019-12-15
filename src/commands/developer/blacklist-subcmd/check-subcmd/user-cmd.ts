import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../../config";
import { Logger } from "clustersv2";
import { db, mdb } from "../../../../modules/Database";
import Eris from "eris";

export default new SubCommand({
	triggers: [
		"user",
		"u"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Check if a user is blacklisted.",
	usage: "<id>",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const u = await msg.getUserFromArgs();
	if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
	const { id } = u;
	const usr = await db.getUser(id);

	if (!usr) return msg.reply(`Failed to fetch user entry for **${id}**`);
	if (usr.blacklist.blacklisted) return msg.reply(`**${id}** is blacklisted, reason: ${usr.blacklist.reason}.`);
	else return msg.reply(`**${id}** is not blacklisted.`);
}));
