import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Colors, Command, EmbedBuilder } from "core";
import { Request } from "utilities";
import { JSONResponse } from "yiffy";
import { Redis } from "../../db";
import Yiffy from "../../util/req/Yiffy";

export default new Command<FurryBot, UserConfig, GuildConfig>(["fursuit"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const img = await Yiffy.furry.fursuit("json", 1);
		if (!img) throw new TypeError(`API method "furry.${msg.args[0].toLowerCase()}" did not return an image.`);
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("OwO", this.bot.user.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setDescription([
					`[[{lang:other.images.shortURL}]](${img.shortURL})`,
					`[[{lang:other.images.reportURL}]](${img.reportURL})`,
					`${!img.sources || img.sources.length === 0 || !img.sources[0] ? `[{lang:other.images.noSource}]` : `[[{lang:other.images.source}]](${img.sources[0]})`}`
				].join("\n"))
				.setColor(Colors.gold)
				.setImage(img.url)
				.toJSON()
		});
	});
