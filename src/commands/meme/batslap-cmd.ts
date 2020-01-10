import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import GenericMemeCommand from "../../util/CommandHandler/lib/generics/GenericMemeCommand";

export default new Command({
	triggers: [
		"batslap"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "slap someone",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	let a = "https://i.furry.bot/furry.png";
	if (msg.args.length === 0) {
		a = msg.author.avatarURL;
		msg.args = ["https://i.furry.bot/furry.png"];
	} else {
		if (msg.mentions.length > 0 && msg.args[0].match(new RegExp(`<@!?${msg.mentions[0].id}>`))) {
			const u = msg.mentions.shift();
			msg.args = msg.args.slice(1);
			a = u.avatarURL;
		}
		msg.args = [msg.author.avatarURL];
	}
	return GenericMemeCommand.handleImage(this, msg, "slap", { avatars: [a || msg.author.avatarURL] });
}));
