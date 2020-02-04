import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import { Request } from "../../util/Functions";

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
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// await msg.channel.startTyping();
	const img = await Request.imageAPIRequest(true, "birb");
	if (img.success === false) return msg.reply(`Image API returned an error: ${img.error.description}`);
	return msg
		.channel
		.createMessage({
			embed: {
				title: "Birb!",
				description: `[Image URL](${img.response.image})`,
				timestamp: new Date().toISOString(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				color: Math.floor(Math.random() * 0xFFFFFF),
				image: {
					url: img.response.image
				}
			}
		})
		.catch(err => null);
}));
