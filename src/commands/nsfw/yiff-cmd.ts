import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Yiffy from "../../util/req/Yiffy";
import { JSONResponse } from "yiffy";
import Language from "../../util/Language";
import config from "../../config";

export default new Command(["yiff"], __filename)
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
		let type: string;
		if (!msg.args[0]) type = msg.gConfig.settings.defaultYiffType;
		else {
			if (!config.yiffTypes.includes(msg.args[0])) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidYiff`, [msg.args[0].toLowerCase(), config.yiffTypes.map(v => `**${v}**`).join(", ")]));
			else type = msg.args[0].toLowerCase();
		}
		const img = await Yiffy.furry.yiff[type]?.("json", 1) as JSONResponse;
		if (!img) throw new TypeError(`API method "furry.yiff.${type}" did not return an image.`);
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.titles.${type}}`)
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
