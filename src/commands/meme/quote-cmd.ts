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
		"quote"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "Quote someone",
	usage: "<text>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	let avatar = msg.author.avatarURL,
		username = msg.author.username;
	if (msg.mentions.length > 0 && msg.args[0].match(new RegExp(`<@!?${msg.mentions[0].id}>`))) {
		msg.args = msg.args.slice(1);
		const k = msg.mentions.shift();
		avatar = k.avatarURL;
		username = k.username;
	}
	return GenericMemeCommand.handleText(this, msg, cmd.triggers[0], { avatars: [avatar], usernames: [username] });
}));
