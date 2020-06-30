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
	const hard = msg.dashedArgs.unparsed.value.includes("hard");
	if (msg.dashedArgs.unparsed.value.includes("full")) {
		await msg.reply(`performing full ${hard ? "hard " : ""}shutdown.`);
		this.ipc.totalShutdown(true);
	} else {
		await msg.reply(`performing a ${hard ? "hard" : "soft"} restart on all clusters.`);
		this.ipc.restartAllClusters();
	}
}));
