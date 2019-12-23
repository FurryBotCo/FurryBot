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
		"note"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "Passing notes..",
	usage: "<text>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	return GenericMemeCommand.handleText(this, msg, cmd.triggers[0]);
}));
