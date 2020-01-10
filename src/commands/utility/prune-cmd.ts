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
		"prune",
		"purge",
		"clear"
	],
	userPermissions: [
		"manageMessages"
	],
	botPermissions: [
		"manageMessages"
	],
	cooldown: 1.5e3,
	donatorCooldown: 1.5e3,
	description: "Clear messages in a channel.",
	usage: "<2-100>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	let count = parseInt(msg.args[0], 10);
	if (msg.args.length === 0 || isNaN(count)) throw new Error("ERR_INVALID_USAGE");
	if (count < 2 || count > 100) return msg.reply("Please provide a valid number between two (2) and 100.");
	if (count < 100) count++;

	const m = await msg.channel.getMessages(count);
	const f = m.filter(d => !(d.timestamp + 12096e5 < Date.now()));
	await msg.channel.deleteMessages(f.map(j => j.id));
	// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "purgeMessages", count, actual: f.length, timestamp: Date.now() });
	if (m.length !== f.length) await msg.channel.createMessage(`Skipped ${m.length - f.length} message(s), reason: over 2 weeks old.`);
}));
