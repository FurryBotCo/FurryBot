import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";

export default new Command({
	triggers: [
		"dog",
		"doggo",
		"puppy"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a picture of a doggo!",
	usage: "",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	let req, j, parts;
	try {
		req = await phin({
			method: "GET",
			url: "https://dog.ceo/api/breeds/image/random",
			headers: {
				"User-Agent": config.web.userAgent
			},
			timeout: 5e3
		});
		j = JSON.parse(req.body);
		parts = j.message.replace("https://", "").split("/");

		return msg.channel.createMessage(`Breed: ${parts[2]}`, {
			file: await this.f.getImageFromURL(j.message),
			name: `${parts[2]}_${parts[3]}.png`
		});
	} catch (e) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, e);
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, j);
		return msg.channel.createMessage("unknown api error", {
			file: await this.f.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));
