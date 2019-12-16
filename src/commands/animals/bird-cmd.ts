import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";

export default new Command({
	triggers: [
		"bird",
		"birb"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a picture of a birb!",
	usage: "",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const img = await this.f.imageAPIRequest(true, "birb");
	if (img.success === false) return msg.reply(`Image API returned an error: ${img.error.description}`);
	try {
		return msg.channel.createMessage("", {
			file: await this.f.getImageFromURL(img.response.image),
			name: img.response.name
		});
	} catch (e) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, e);
		return msg.channel.createMessage("unknown api error", {
			file: await this.f.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));
