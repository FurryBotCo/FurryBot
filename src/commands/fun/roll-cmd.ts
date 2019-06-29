import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import _ from "lodash";

export default new Command({
	triggers: [
		"roll"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Roll the dice",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let min, max;
	min = typeof msg.args[0] !== "undefined" ? parseInt(msg.args[0], 10) : 1;
	max = typeof msg.args[1] !== "undefined" ? parseInt(msg.args[1], 10) : 20;

	return msg.channel.createMessage(`<@!${msg.author.id}>, you rolled a ${_.random(min, max)}!`);
}));