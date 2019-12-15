import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "clustersv2";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"leaveserver"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Make me leave a server.",
	usage: "<id>",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const guild = await this.getRESTGuild(msg.args[0]).catch(err => null);

	if (!guild) return msg.reply("failed to fetch guild.");

	return guild
		.leave()
		.then(() => msg.reply(`left guild **${guild.name}** (${guild.id})`))
		.catch((err) => msg.reply(`there was an error while doing this: ${err}`));
}));
