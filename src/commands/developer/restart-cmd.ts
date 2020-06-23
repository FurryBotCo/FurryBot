import Command from "../../modules/CommandHandler/Command";
import { Time } from "../../util/Functions";
import * as fs from "fs-extra";
import config from "../../config";

export default new Command({
	triggers: [
		"restart"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["developer"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	this.ipc.restartAllClusters();
	return msg.reply(`restarting all clusters..`);
}));
