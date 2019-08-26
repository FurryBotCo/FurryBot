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
		"say"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Make the bot say something (dev only)",
	usage: "[text]",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	// extra check, to be safe
	if (!config.developers.includes(msg.author.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot run this command as you are not a developer of this bot.`);
	await msg.delete().catch(err => null);
	return msg.channel.createMessage(msg.unparsedArgs.join(" "));
}));