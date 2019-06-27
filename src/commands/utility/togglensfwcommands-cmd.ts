import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"togglensfwcommands",
		"togglensfw"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggle NSFW Commands",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.gConfig.nsfwEnabled) return msg.gConfig.edit({ nsfwEnabled: false }).then(d => d.reload()).then(() => msg.reply("Enabled nsfw commands."));
	else return msg.gConfig.edit({ nsfwEnabled: true }).then(d => d.reload()).then(() => msg.reply("Disabled nsfw commands."));
}));