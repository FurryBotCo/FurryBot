import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import Language from "language";
import { Colors, Command, EmbedBuilder } from "core";
import fetch from "node-fetch";

export default new Command<FurryBot, UserConfig, GuildConfig>(["cat", "kitty"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const img = await fetch("https://api.thecatapi.com/v1/images/search", {
			method: "GET",
			headers: {
				"X-API-Key": config.apis.cat,
				"User-Agent": config.web.userAgent
			}
		}).then(v => v.json()).then((v: Array<{ url: string;}>) => v[0].url);
		if (!img) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.imageAPI"));
		return msg.channel.createMessage({
			embed:
				new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setTimestamp(new Date().toISOString())
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setColor(Colors.furry)
					.setImage(img)
					.toJSON()
		});
	});
