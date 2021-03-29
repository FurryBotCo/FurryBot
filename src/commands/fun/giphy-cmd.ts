import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import { Colors, Command, CommandError, EmbedBuilder } from "core";
import Language from "language";
import fetch from "node-fetch";
import { Request } from "utilities";

export default new Command<FurryBot, UserConfig, GuildConfig>(["giphy"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) throw new CommandError("INVALID_USAGE", cmd);
		const { data } = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${config.apis.giphy}&q=${msg.args.join("%20")}&limit=50&offset=7&rating=PG-13&lang=en`, {
			method: "GET",
			headers: {
				"User-Agent": config.web.userAgent
			},
			timeout: 5e3
		}).then(v => v.json() as Promise<{
			data: Array<{ // there's more but I dont' care
				images: {
					fixed_width: {
						url: string;
					};
				};
			}>;
		}>);

		if (data.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noResults`, [msg.args.join(" ")]));


		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.title|${msg.args.join(" ")}}`)
				.setImage(data[Math.floor(Math.random() * data.length)].images.fixed_width.url)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setThumbnail("attachment://PoweredByGiphy.png")
				.setFooter(`{lang:${cmd.lang}.disclaimer}`)
				.toJSON()
		}, {
			file: await Request.getImageFromURL("https://assets.furry.bot/PoweredByGiphy.png"),
			name: "PoweredByGiphy.png"
		});
	});
