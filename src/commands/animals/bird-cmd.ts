import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import { Request } from "../../util/Functions";

export default new Command({
	triggers: [
		"bird",
		"bird"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a picture of a birb!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	const img = await Request.imageAPIRequest(true, "birb");
	if (img.success === false) return msg.reply(`Image API returned an error: ${img.error.description}`);
	try {
		return msg.channel.createMessage("", {
			file: await Request.getImageFromURL(img.response.image),
			name: img.response.name
		});
	} catch (e) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, e);
		return msg.channel.createMessage("unknown api error", {
			file: await Request.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));
