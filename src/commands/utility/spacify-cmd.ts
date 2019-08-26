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
		"spacify"
	],
	userPermissions: [
		"manageChannels"
	],
	botPermissions: [
		"manageChannels"
	],
	cooldown: 3e3,
	description: "Replaces dashes with 'spaces' in channel names.",
	usage: "<channel>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");
	const ch = await msg.getChannelFromArgs();
	if (!ch) return msg.errorEmbed("INVALID_CHANNEL");
	if (ch.name.indexOf("-") === -1) return msg.channel.createMessage("Channel name contains no dashes (-) to replace.");
	await ch.edit({
		name: ch.name.replace(/-/g, "\u2009\u2009")
	}, `${msg.author.username}#${msg.author.discriminator}: Spacify ${ch.name}`);
	return msg.channel.createMessage(`Spacified <#${ch.id}>!`);
}));