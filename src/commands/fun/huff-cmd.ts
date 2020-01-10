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
		"huff"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Blow someones house down..",
	usage: "<@member/text>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");

	const input = msg.args.join(" ");
	const text = this.f.formatStr(this.f.fetchLangMessage(msg.gConfig.settings.lang, cmd), msg.author.mention, input);
	msg.channel.createMessage(text, {
		file: await this.f.getImageFromURL("https://assets.furry.bot/huff.gif"),
		name: "huff.gif"
	});
}));
