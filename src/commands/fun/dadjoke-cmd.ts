import config from "../../config";
import Command from "../../util/cmd/Command";
import phin from "phin";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command(["dadjoke"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
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

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setDescription(req.body.joke)
				.setThumbnail("https://static1.e621.net/data/c4/b3/c4b393d3135bab89ef66139491d0d112.png")
				.setColor(Colors.gold)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});
	});
