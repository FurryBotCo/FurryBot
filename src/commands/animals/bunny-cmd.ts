import Yiffy from "../../util/req/Yiffy";
import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import LocalFunctions from "../../util/LocalFunctions";
import Language from "../../util/Language";
import { Colors, Command, EmbedBuilder } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["birb", "bird", "borb"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const img = await LocalFunctions.chewyBotAPIRequest("bunny");
		if (!img) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.imageAPI"));
		return msg.channel.createMessage({
			embed:
					new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle(`{lang:${cmd.lang}.title}`)
						.setDescription(`[{lang:other.words.imageURL}](${img})`)
						.setTimestamp(new Date().toISOString())
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setColor(Colors.furry)
						.setImage(img)
						.toJSON()
		});
	});
