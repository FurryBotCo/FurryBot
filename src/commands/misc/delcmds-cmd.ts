import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";
import { mdb } from "../../modules/Database";

export default new Command({
	triggers: [
		"delcmds"
	],
	userPermissions: [
		"manageMessages"
	],
	botPermissions: [
		"manageMessages"
	],
	cooldown: .75e3,
	description: "Toggle command deletion",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.gConfig.deleteCommands) return msg.gConfig.edit({ deleteCommands: false }).then(d => d.reload()).then(() => msg.reply("Disabled deleting command invocations."));
	else return msg.gConfig.edit({ deleteCommands: true }).then(d => d.reload()).then(() => msg.reply("Enabled deleting command invocations."));
}));