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
		"prune",
		"purge",
		"clear"
	],
	userPermissions: [
		"manageMessages"
	],
	botPermissions: [
		"manageMessages"
	],
	cooldown: .5e3,
	description: "Clear messages in a channel",
	usage: "<2-100>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let count = parseInt(msg.args[0], 10);
	if (msg.args.length === 0 || isNaN(count)) return new Error("ERR_INVALID_USAGE");
	if (count < 2 || count > 100) return msg.reply("Please provide a valid number between two (2) and 100.");
	if (count < 100) count++;

	const m = await msg.channel.getMessages(count);
	const f = m.filter(d => !(d.timestamp + 12096e5 < Date.now()));
	await msg.channel.deleteMessages(f.map(j => j.id));
	if (m.length !== f.length) await msg.channel.createMessage(`Skipped ${m.length - f.length} message(s), reason: over 2 weeks old.`);
}));