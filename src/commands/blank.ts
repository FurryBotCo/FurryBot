import FurryBot from "../main";
import { ExtendedMessage } from "bot-stuff";
import functions from "../util/functions";
import config from "../config";
import CmdHandler from "../util/cmd";
import { Logger } from "clustersv2";
import { CommandError } from "command-handler";
import UserConfig from "../modules/config/UserConfig";
import GuildConfig from "../modules/config/GuildConfig";

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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {

		})
	});

*/

export default null;
