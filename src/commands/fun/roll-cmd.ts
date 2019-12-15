import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "clustersv2";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import _ from "lodash";

export default new Command({
	triggers: [
		"roll"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Roll the dice.",
	usage: "",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	const min = typeof msg.args[0] !== "undefined" ? parseInt(msg.args[0], 10) : 1;
	const max = typeof msg.args[1] !== "undefined" ? parseInt(msg.args[1], 10) : 20;

	return msg.channel.createMessage(`<@!${msg.author.id}>, you rolled a ${_.random(min, max)}!`);
}));
