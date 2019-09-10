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
		"8ball"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Ask the magic 8ball a question!",
	usage: "<question>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");
	const responses = [
		"It is certain",
		"Without a doubt",
		"Most likely",
		"Yes",
		"Reply was hazy, try again later",
		"Ask again later",
		"My answer is no",
		"No",
		"Very doubtful"
	],
		response = responses[Math.floor(Math.random() * responses.length)];
	return msg.reply(`The Magic 8ball said **${response}**.`);
}));