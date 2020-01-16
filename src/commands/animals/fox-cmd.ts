import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import { Request } from "../../util/Functions";

export default new Command({
	triggers: [
		"fox",
		"foxxo",
		"foxyboi"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a picture of a fox!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	try {
		return msg.channel.createMessage("", {
			file: await Request.getImageFromURL("https://foxrudor.de/"),
			name: "foxrudor.de.png"
		});
	} catch (e) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, e);
		return msg.channel.createMessage("unknown api error", {
			file: await Request.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));
