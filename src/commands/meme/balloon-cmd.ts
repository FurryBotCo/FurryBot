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
		"balloon"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 5e3,
	description: "Nothing will pop this",
	usage: "<text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let text, req, j;
	text = msg.unparsedArgs.join(" ");
	if (text.length === 0) text = "Image api, not providing text";
	req = await functions.memeRequest("/balloon", [], text);
	if (req.statusCode !== 200) {
		try {
			j = { status: req.statusCode, message: JSON.stringify(req.body) };
		} catch (error) {
			j = { status: req.statusCode, message: req.body };
		}
		msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
		return this.logger.log(`text: ${text}`);
	}
	return msg.channel.createMessage("", {
		file: req.body,
		name: "balloon.png"
	}).catch(err => msg.reply(`Error sending: ${err}`));
}));