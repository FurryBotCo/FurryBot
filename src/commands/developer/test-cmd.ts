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
		"test"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Some stuff for testing",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (!msg.args[0]) return msg.reply("tested..");

	switch (msg.args[0].toLowerCase()) {
		case "err":
			throw new Error("ERR_TESTING");
			break;

		default:
			return msg.reply("invalid test.");
	}
}));
