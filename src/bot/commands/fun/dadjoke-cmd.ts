import config from "../../../config";
import Command from "../../../util/cmd/Command";
import phin from "phin";

export default new Command(["dadjoke"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const req = await phin<{ joke: string; }>({
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
	});
