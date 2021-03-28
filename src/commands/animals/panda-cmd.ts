import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import LocalFunctions from "../../util/LocalFunctions";
import Language from "language";
import { Colors, Command, EmbedBuilder } from "core";
import { Request } from "utilities";

export default new Command<FurryBot, UserConfig, GuildConfig>(["panda"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const red = msg.args[0]?.toLowerCase() === "red";
		const img = await (red ? Request.fetchURL("https://some-random-api.ml/img/red_panda").then(v => (JSON.parse(v.toString()) as { link: string; }).link) : LocalFunctions.chewyBotAPIRequest("panda"));
		if (!img) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.imageAPI"));
		return msg.channel.createMessage({
			embed:
					new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle(`{lang:${cmd.lang}.title${red ? "Red" : ""}}`)
						.setTimestamp(new Date().toISOString())
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setColor(Colors.furry)
						.setImage(img)
						.toJSON()
		});
	});
