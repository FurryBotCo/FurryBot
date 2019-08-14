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
		"armor"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 5e3,
	description: "Nothing can penetrate my armor.",
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
	if (text.length === 0) text = "Provide some text";
	req = await functions.memeRequest("/armor", [], text);
	if (req.statusCode !== 200) {
		try {
			j = { status: req.statusCode, message: JSON.stringify(req.body) };
		} catch (error) {
			j = { status: req.statusCode, message: req.body };
		}
		msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
		return this.logger.log(`text: ${text}`, msg.guild.shard.id);
	}
	return msg.channel.createMessage("", {
		file: req.body,
		name: "armor.png"
	}).catch(err => msg.reply(`Error sending: ${err}`));
}));