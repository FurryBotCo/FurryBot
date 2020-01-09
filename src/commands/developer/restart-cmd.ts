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
		"restart"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Make me restart.",
	usage: "",
	features: ["devOnly"]
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const time = await this.f.ms((this.shards.size * 7) * 1e3, true);
	return msg.reply(`restarting.. This may take ${time} or more.`).then(() => process.exit());
}));
