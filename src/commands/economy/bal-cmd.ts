import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";
import { mdb } from "../../modules/Database";

export default new Command({
	triggers: [
		"bal",
		"balance",
		"$"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Check your economy balance",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

	if (isNaN(msg.uConfig.bal) || msg.uConfig.bal === Infinity) return msg.reply("You have been temporarily suspended from using economy commands, please join our support server (<https://discord.gg/YazeA7e>) and tell them that something is wrong with your economy balance. Attempts to circumvent this may get you blacklisted.");

	if (msg.args.length > 0) {
		const user = await msg.getUserFromArgs();
		if (!user) return msg.errorEmbed("INVALID_USER");

		const bal = await mdb.collection("users").findOne({ id: user.id }).then(res => res.bal).catch(err => 100);
		return msg.reply(`${user.username}#${user.discriminator}'s balance is **${bal}**${config.eco.emoji}`);
	} else return msg.reply(`Your balance is **${msg.uConfig.bal}**${config.eco.emoji}`);
}));