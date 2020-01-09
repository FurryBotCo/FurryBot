import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"blacklist",
		"bl"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Send a direct message to a user.",
	usage: "<id> <message>",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length > 0) return new Error("ERR_INVALID_USAGE");

	const user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	const dm = await user.getDMChannel();

	if (!dm) return msg.reply(`failed to fetch dm channel for **${user.username}#${user.discriminator}** (${user.id})`);

	const m = await dm.createMessage(msg.args.slice(1, msg.args.length).join(" ")).catch(err => null);

	if (!m) return msg.reply(`failed to dm **${user.username}#${user.discriminator}** (${user.id}), they might have their dms closed.`);

	return msg.reply(`sent direct message "${msg.args.slice(1, msg.args.length).join(" ")}" to **${user.username}#${user.discriminator}** (${user.id})`);
}));
