import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import { Colors, Command,  EmbedBuilder } from "core";
import fetch from "node-fetch";

export default new Command<FurryBot, UserConfig, GuildConfig>(["dadjoke", "joke"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg) {
		const { joke } = await fetch("https://icanhazdadjoke.com", {
			method: "GET",
			headers: {
				"Accept": "application/json",
				"User-Agent": config.web.userAgent
			},
			timeout: 5e3
		}).then(v => v.json() as Promise<{ joke: string; }>);

		// sauce: https://e926.net/posts/1535420
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setDescription(joke)
				.setThumbnail("https://i.furry.bot/dadjoke.png")
				.setColor(Colors.gold)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});
	});
