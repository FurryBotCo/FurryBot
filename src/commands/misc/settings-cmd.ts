import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";

export default new Command({
	triggers: [
		"settings"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [
		"manageGuild"
	],
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
	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");

	const settings = ["fResponse"];
	const choices = ["enabled", "enable", "e", "true", "disabled", "disable", "d", "false"];

	if (!settings.map(s => s.toLowerCase()).includes(msg.args[0].toLowerCase())) msg.reply(`Invalid setting, valid settings: **${settings.join("**, **")}**`);

	if (!choices.includes(msg.args[1].toLowerCase())) msg.reply("Invalid choice, try **enabled** or **disabled**.");

	switch (msg.args[0].toLowerCase()) {
		case "fresponse":
			switch (msg.args[1].toLowerCase()) {
				case "enabled":
				case "enable":
				case "e":
				case "true":
					await msg.gConfig.edit({ fResponseEnabled: true }).then(d => d.reload());
					return msg.reply("Enabled the f auto response, run again to disable.");
					break;

				case "disabled":
				case "disable":
				case "d":
				case "false":
					await msg.gConfig.edit({ fResponseEnabled: false }).then(d => d.reload());
					return msg.reply("Disabled the f auto response, run again to enable.");
					break;
			}
	}
}));