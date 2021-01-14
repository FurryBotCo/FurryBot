import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Yiffy from "../../util/req/Yiffy";
import { JSONResponse } from "yiffy";

export default new Command(["bulge"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([
		"nsfw"
	])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const img = await Yiffy.furry.bulge("json", 1) as JSONResponse;
		if (!img) throw new TypeError("API method \"furry.bulge\" did not return an image.");
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("OwO", this.bot.user.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setDescription([
					`[[{lang:other.images.shortURL}]](${img.shortURL})`,
					`[[{lang:other.images.reportURL}]](${img.reportURL})`,
					`${!img.sources || img.sources.length === 0 || !img.sources[0] ? "[{lang:other.images.noSource}]" : `[[{lang:other.images.source}]](${img.sources[0]})`}`
				].join("\n"))
				.setColor(Colors.gold)
				.setImage(img.url)
				.toJSON()
		});
	});
