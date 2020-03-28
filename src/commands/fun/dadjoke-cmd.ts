import Command from "../../util/CommandHandler/lib/Command";
import config from "../../config";
import phin from "phin";

export default new Command({
	triggers: [
		"dadjoke"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
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
