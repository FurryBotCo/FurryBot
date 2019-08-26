import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";

export default new Command({
	triggers: [
		"dictionary",
		"throw",
		"dict"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Throw a dictionary at someone to teach them some knowledge!",
	usage: "<@member/text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let input, text;
	if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");

	input = msg.args.join(" ");
	text = functions.formatStr(msg.c, msg.author.mention, input);
	msg.channel.createMessage(text);
}));