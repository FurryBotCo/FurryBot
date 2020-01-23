import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import { Request } from "../../util/Functions";

export default new Command({
	triggers: [
		"snek",
		"snake",
		"noodle",
		"dangernoodle"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a picture of a snek!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// await msg.channel.startTyping();
	let req, j;
	try {
		req = await phin({
			method: "GET",
			url: "https://api.chewey-bot.top/snake",
			headers: {
				"User-Agent": config.web.userAgent,
				"Authorization": config.apis.chewyBot.key
			},
			timeout: 5e3
		});
		j = JSON.parse(req.body);

		return msg.channel.createMessage("", {
			file: await Request.getImageFromURL(j.data),
			name: j.data.split("/").reverse()[0]
		});
	} catch (e) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, e);
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, j);
		return msg.channel.createMessage("unknown api error", {
			file: await Request.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));
