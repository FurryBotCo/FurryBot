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
	// this is misspelled on purpose, `slap` is used by a command in the fun category
	triggers: [
		"splap"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "slap someone",
	usage: "",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	const a = msg.args.shift();
	msg.args = ["https://i.furry.bot/furry.png"];
	return GenericMemeCommand.handleImage(this, msg, "slap", { avatars: [a || msg.author.avatarURL] });
}));
