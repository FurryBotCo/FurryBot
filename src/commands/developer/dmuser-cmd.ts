import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";
import * as fs from "fs-extra";

export default new Command({
	triggers: [
		"dmuser"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Send a direct message to a user.",
	usage: "<type>",
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

	if (msg.args.length > 0) return new Error("ERR_INVALID_USAGE");

	const user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("ERR_INVALID_USER");

	const dm = await user.getDMChannel();

	if (!dm) return msg.reply(`failed to fetch dm channel for **${user.username}#${user.discriminator}** (${user.id})`);

	const m = await dm.createMessage(msg.args.slice(1, msg.args.length).join(" "));

	if (!m) return msg.reply(`failed to dm **${user.username}#${user.discriminator}** (${user.id}), they might have their dms closed.`);

	return msg.reply(`sent direct message "${msg.args.slice(1, msg.args.length).join(" ")}" to **${user.username}#${user.discriminator}** (${user.id})`);
}));