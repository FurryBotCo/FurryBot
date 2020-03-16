import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Utility } from "../../util/Functions";
import Eris from "eris";

export default new Command({
	triggers: [
		"disable"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 5e3,
	description: "Disable commands in this server.",
	usage: "<command> [channel]",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	let s = true, ch: Eris.GuildTextableChannel;
	if (msg.args.length > 1) {
		ch = await msg.getChannelFromArgs(1);
		if (!ch) return msg.errorEmbed("INVALID_CHANNEL");
		s = false;
	}
}));
