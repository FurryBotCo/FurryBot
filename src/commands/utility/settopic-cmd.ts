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
		"settopic",
		"st"
	],
	userPermissions: [
		"manageChannels"
	],
	botPermissions: [
		"manageChannels"
	],
	cooldown: 1e3,
	description: "Set a channels topic",
	usage: "[channel] <topic>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	await msg.channel.edit({ topic: msg.unparsedArgs.join(" ") }, `Command: ${msg.author.username}#${msg.author.discriminator}`).then((c: Eris.TextChannel) =>
		msg.channel.createMessage(`Set the topic of <#${c.id}> to **${!c.topic ? "NONE" : c.topic}**`)
	);
}));