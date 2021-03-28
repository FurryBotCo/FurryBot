import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import Language from "language";
import { Colors, Command, EmbedBuilder } from "core";
import { Request } from "utilities";

export default new Command<FurryBot, UserConfig, GuildConfig>(["fox", "foxxo"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const img = await Request.getImageFromURL("https://foxrudor.de");
		if (!img) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.imageAPI"));
		return msg.channel.createMessage({
			embed:
				new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setTimestamp(new Date().toISOString())
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setColor(Colors.furry)
					.setImage("attachment://fox.png")
					.toJSON()
		}, {
			file: img,
			name: "fox.png"
		});
	});
