import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import phin from "phin";
import config from "../../config";

export default new Command({
	triggers: [
		"cat"
	],
	permissions: {
		user: [],
		bot: [
			"attachFiles",
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const img = await phin<any>({
		method: "GET",
		url: "https://api.thecatapi.com/v1/images/search",
		parse: "json",
		headers: {
			"X-API-Key": config.apiKeys.cat,
			"User-Agent": config.web.userAgent
		}
	}).then(b => b.body);

	return msg.channel.createMessage({
		embed:
			new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.animals.cat.title}")
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.setImage(img[0].url)
				.toJSON()
	});
}));
