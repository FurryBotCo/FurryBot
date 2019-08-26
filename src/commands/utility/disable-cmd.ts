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
		"disable"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 5e3,
	description: "Disable commands or categories in your server. If no second argument is provided, server-wide will be used.",
	usage: "<command/category> [@role/@member/#channel/server]",
	nsfw: false,
	devOnly: false,
	betaOnly: true,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (typeof msg.gConfig.commandConfig.disabled === "undefined") await msg.gConfig.edit({ commandConfig: { disabled: [] } }).then(d => d.reload());

	let type;

	const bl = [
		"disable",
		"enable",
		"help",
		"toggletips",
		"delcmds"
	];

	if (bl.includes(msg.args[0].toLowerCase())) return msg.reply(`**${msg.args[0].toLowerCase()}** is a blacklisted category/command, and cannot be disabled, or enabled.`);

	if (msg.args.length === 1) {
		type = "server";

		let c;
		c = this.getCommand(msg.args[0].toLowerCase());
		if (!c) c = this.getCategory(msg.args[0].toLowerCase());

		if (!c) return msg.reply("that was not a valid command, or category");

		if (msg.gConfig.commandConfig.disabled.filter((c) => c.selectionType === type).map(c => c.selection.toLowerCase().includes(msg.args[0].toLowerCase()))) return msg.reply("that selection is already disabled.");
	} else {

	}
}));