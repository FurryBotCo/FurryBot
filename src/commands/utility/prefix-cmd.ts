import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";

export default new Command({
	triggers: [
		"prefix",
		"setprefix"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 3e3,
	description: "Change the bots prefix for this guild (server)",
	usage: "<new prefix>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");

	if (msg.unparsedArgs[0].length < 1 || msg.unparsedArgs[0].length > 30) return msg.reply("The prefix must be between 1 and 30 characters.");

	if (msg.unparsedArgs[0].toLowerCase() === msg.gConfig.prefix.toLowerCase()) return msg.reply("That is already this servers prefix.");

	await msg.gConfig.edit({ prefix: msg.unparsedArgs[0].toLowerCase() }).then(d => d.reload());

	return msg.reply(`Set this servers prefix to \`${msg.gConfig.prefix}\`, you can view this at any time by mentioning me, <@!${this.user.id}>`);
}));