import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import phin from "phin";

export default new Command({
	triggers: [
		"dadjoke",
		"dad"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 4e3,
	donatorCooldown: 2e3,
	description: "Get a dadjoke!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	const req = await phin({
		method: "GET",
		url: "https://icanhazdadjoke.com",
		headers: {
			"Accept": "application/json",
			"User-Agent": config.web.userAgent
		},
		parse: "json",
		timeout: 5e3
	});

	return msg.channel.createMessage(req.body.joke);
}));
