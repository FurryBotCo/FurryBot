import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"balloon"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "Nothing will pop this.",
	usage: "<text>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	let j;
	let text = msg.unparsedArgs.join(" ");
	if (text.length === 0) text = "Image api, not providing text";
	const req = await this.f.memeRequest("/balloon", [], text);
	if (req.statusCode !== 200) {
		try {
			j = { status: req.statusCode, message: JSON.stringify(req.body) };
		} catch (error) {
			j = { status: req.statusCode, message: req.body };
		}
		msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
		return Logger.log(`text: ${text}`, msg.guild.shard.id);
	}
	return msg.channel.createMessage("", {
		file: req.body,
		name: "balloon.png"
	}).catch(err => msg.reply(`Error sending: ${err}`));
}));
