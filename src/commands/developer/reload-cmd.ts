import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import { execSync } from "child_process";
import Eris from "eris";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"reload"
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
	return msg.reply("not implemented yet.");
}));
