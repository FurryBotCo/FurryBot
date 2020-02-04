import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import { Request } from "../../util/Functions";

export default new Command({
	triggers: [
		"cat"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a picture of a cat!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	return msg.channel.createMessage({
		embed: {
			title: "Kitty!",
			timestamp: new Date().toISOString(),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			color: Math.floor(Math.random() * 0xFFFFFF),
			image: {
				url: "https://cataas.com/cat/gif"
			}
		}
	}).catch(err => null);
}));
