import client from "../../index";
import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import functions from "../util/functions";
import config from "../config";
import { Command } from "../util/CommandHandler";


type CommandContext = FurryBot & { _cmd: Command };

/*

client.cmdHandler
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
		run: (async function (this: CommandContext, msg: ExtendedMessage) {

		})
	});

*/

export default null;