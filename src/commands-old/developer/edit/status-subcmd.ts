import FurryBot from "@FurryBot";
import ExtendedMessage from "../../../modules/extended/ExtendedMessage";
import Command from "../../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../../config";

export default new Command({
	triggers: [
		"status"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Change the bots status",
	usage: "<status>",
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
	if (msg.args.length <= 0) return new Error("ERR_INVALID_USAGE");
	const types = ["online", "idle", "dnd", "invisible"];
	if (!types.includes(msg.args[0].toLowerCase())) return msg.channel.createMessage(`<@!${msg.author.id}>, invalid type. Possible types: **${types.join("**, **")}**.`);
	const game = this.guilds.filter(g => g.members.has(this.user.id))[0].members.get(this.user.id).game;

	try {
		this.editStatus(msg.args[0].toLowerCase(), game);
		return msg.reply(`set bots status to ${msg.args[0].toLowerCase()}`);
	} catch (e) {
		return msg.reply(`There was an error while doing this: ${e}`);
	}
}));