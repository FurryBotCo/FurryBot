import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import phin from "phin";
import config from "../../config";
import Language from "../../util/Language";

export default new Command(["cat"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const img = await phin<any>({
			method: "GET",
			url: "https://api.thecatapi.com/v1/images/search",
			parse: "json",
			headers: {
				"X-API-Key": config.apis.cat,
				"User-Agent": config.web.userAgent
			}
		}).then(b => b.body);

		if (!img) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.imageAPI"));
		return msg.channel.createMessage({
			embed:
				new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setTimestamp(new Date().toISOString())
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setColor(Math.floor(Math.random() * 0xFFFFFF))
					.setImage(img[0].url)
					.toJSON()
		});
	});
