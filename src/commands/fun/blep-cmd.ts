import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import Yiffy from "../../util/req/Yiffy";
import { BotFunctions, Colors, Command, EmbedBuilder } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["blep"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const img = await Yiffy.animals.blep("json", 1);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.possible|${msg.author.id}|${BotFunctions.extraArgParsing(msg)}}`)
				.setImage(img.url)
				.setTimestamp(new Date().toISOString())
				.setFooter("OwO", this.client.user.avatarURL)
				.setColor(Colors.gold)
				.toJSON()
		});
	});
