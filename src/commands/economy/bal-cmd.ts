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
		"bal",
		"balance",
		"$"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
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

	if (msg.args.length > 0) {
		const user = await msg.getUserFromArgs();
		if (!user) return msg.errorEmbed("INVALID_USER");

		const bal = await mdb.collection("users").findOne({ id: user.id }).then(res => res.bal);
		return msg.reply(`${user.username}#${user.discriminator}'s balance is **${bal}**${config.ecoEmoji}`);
	} else return msg.reply(`Your balance is **${msg.uConfig.bal}**${config.ecoEmoji}`);
}));