import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import functions from "../util/functions";
import config from "../config";
import { Command } from "../util/CommandHandler";
import CmdHandler from "../util/cmd";


type CommandContext = FurryBot & { _cmd: Command };

/*

CmdHandler
	.addCategory({
		name: "",
		displayName: "",
		devOnly: false,
		description: ""
	})
	.addCommand({
		triggers: [
			""
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "",
		usage: "",
		features: [],
		category: "",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {

		})
	});

*/

export default null;
