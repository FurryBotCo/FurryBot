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
		"bap"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Bap someone! Ouch!",
	usage: "<@member/text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");
	let input, text;
	input = msg.args.join(" ");

	text = functions.formatStr(msg.c, msg.author.mention, input);

	if (msg.channel.permissionsOf(this.user.id).has("attachFiles")) {
		msg.channel.createMessage(text, {
			file: await functions.getImageFromURL("https://assets.furry.bot/bap.gif"),
			name: "bap.gif"
		});
	} else {
		msg.channel.createMessage(text);
	}
}));