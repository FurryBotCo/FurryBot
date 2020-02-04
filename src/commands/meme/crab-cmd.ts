import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Strings, Request } from "../../util/Functions";
import { performance } from "perf_hooks";

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
	description: "Crab rave!",
	usage: "<text>",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.unparsedArgs.length < 1) throw new Error("ERR_INVALID_USAGE");

	const m = await msg.channel.createMessage("This command may take a while..");

	const start = performance.now();
	const { body: img } = await Request.memeRequest("/crab", null, null, msg.unparsedArgs.join(" "));
	const end = performance.now();

	await m.edit(`Image fetched in ${(end - start).toFixed(3)}ms`);
	return msg.channel.createMessage("", {
		name: "crab.mp4",
		file: img
	});
}));
