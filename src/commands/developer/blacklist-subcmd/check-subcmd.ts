import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../config";
import { Logger } from "clustersv2";
import { db, mdb } from "../../../modules/Database";
import Eris from "eris";

export default new SubCommand({
	triggers: [
		"check"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Check if a user/server is blacklisted.",
	usage: "<user/server> <id>",
	features: ["devOnly"],
	subCommandDir: `${__dirname}/check-subcmd`
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: SubCommand) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, this);
}));
