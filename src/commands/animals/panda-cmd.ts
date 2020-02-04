import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import { Request } from "../../util/Functions";

export default new Command({
	triggers: [
		"panda"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a picture of a panda!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const img = await Request.chewyBotAPIRequest("panda").catch(err => null);

	if (!img) return msg.reply("failed to fetch image from api, please try again later.");

	return msg
		.channel
		.createMessage({
			embed: {
				title: "Panda!",
				description: `[Image URL](${img})`,
				timestamp: new Date().toISOString(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				color: Math.floor(Math.random() * 0xFFFFFF),
				image: {
					url: img
				}
			}
		});
}));
