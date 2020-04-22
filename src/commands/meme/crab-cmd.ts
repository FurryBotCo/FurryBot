import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Strings, Request, Time } from "../../util/Functions";
import { performance } from "perf_hooks";
import config from "../../config";

export default new Command({
	triggers: [
		"crab"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 12.5e3,
	donatorCooldown: 1e4,
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.unparsedArgs.length < 1) throw new Error("ERR_INVALID_USAGE");

	const m = await msg.channel.createMessage("{lang:commands.meme.crab.time}");

	const { body: img } = await Request.memeRequest("/crab", null, null, msg.unparsedArgs.join(" "));

	let b;
	try {
		b = JSON.parse(img.toString());
	} catch (e) {
		b = null;
	}
	if (b !== null) {
		if (b.error && b.error === "You must submit exactly two strings split by comma") return msg.reply("{lang:commands.meme.crab.invalid}");
		return msg.channel.createMessage(`{lang:commands.meme.crab.error}..\n\`\`\`json\n${JSON.stringify(b)}\n\`\`\`\n\n{lang:commands.meme.crab.support}: ${config.bot.supportURL}`);
	}
	await m.delete();
	return msg.channel.createMessage("", {
		name: "crab.mp4",
		file: img
	});
}));
