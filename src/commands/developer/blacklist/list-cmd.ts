import FurryBot from "@FurryBot";
import ExtendedMessage from "../../../modules/extended/ExtendedMessage";
import Command from "../../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../../config/config";

export default new Command({
	triggers: [
		"list",
		"ls"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Lists blacklist entries",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	const sub = await functions.processSub(msg.cmd.command, msg, this);
	if (sub !== "NOSUB") return;
	else return functions.sendCommandEmbed(msg, msg.cmd.command);
}));