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
		"ship"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "Ship some people!",
	usage: "<@member1> [@member2]",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	return msg.reply("this command has been temporarily disabled, as it does not work properly. There is not an estimated time in which this will be fixed.");
}));
