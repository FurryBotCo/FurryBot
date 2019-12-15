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
		"toggletips"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Toggle getting random tips.",
	usage: "",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.uConfig.tips) return msg.uConfig.edit({ tips: false }).then(d => d.reload()).then(() => msg.reply("Disabled tips."));
	else return msg.uConfig.edit({ tips: true }).then(d => d.reload()).then(() => msg.reply("Enabled tips."));
}));