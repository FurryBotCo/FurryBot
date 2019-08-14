import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";
import { mdb } from "../../modules/Database";

export default new Command({
	triggers: [
		"settings"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: .75e3,
	description: "edit this servers settings",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {

	const settings = ["fResponse", "nsfw", "delCmds"];
	const choices = ["enabled", "enable", "e", "true", "disabled", "disable", "d", "false"];

	if (msg.args.length === 0 || ["list", "ls"].some(s => msg.args[0].toLowerCase().indexOf(s) !== -1)) return msg.reply(`valid settings: **${settings.join("**, **")}**`);

	if (!settings.map(s => s.toLowerCase()).includes(msg.args[0].toLowerCase())) msg.reply(`Invalid setting, valid settings: **${settings.join("**, **")}**`);

	let type;

	switch (msg.args[0].toLowerCase()) {
		case "fresponse":
			type = "fResponseEnabled";
			break;

		case "nsfw":
			type = "nsfwEnabled";
			break;

		case "delcmds":
			type = "delCmds";
			break;
	}

	if (msg.args.length === 1) return msg.reply(`This setting **${type}** is currently set to ${msg.gConfig[type] ? "Enabled" : "Disabled"}, use \`${msg.gConfig.prefix}settings ${msg.args[0]} <enabled/disabled>\` to toggle it.`);

	if (!choices.includes(msg.args[1].toLowerCase())) msg.reply("Invalid choice, try **enabled** or **disabled**.");

	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");


	switch (msg.args[1].toLowerCase()) {
		case "enabled":
		case "enable":
		case "e":
		case "true":
			await msg.gConfig.edit({ [type]: true }).then(d => d.reload());
			return msg.reply(`Enabled ${msg.args[0]}, use \`${msg.gConfig.prefix}settings ${msg.args[0]} disabled\` to disable.`);
			break;

		case "disabled":
		case "disable":
		case "d":
		case "false":
			await msg.gConfig.edit({ [type]: false }).then(d => d.reload());
			return msg.reply(`Disabled ${msg.args[0]}, use \`${msg.gConfig.prefix}settings ${msg.args[0]} enabled\` to enable.`);
			break;
	}
}));