import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Internal from "../../util/Functions/Internal";
import Yiffy from "../../util/req/Yiffy";

export default new Command(["blep"], __filename)
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
				.setDescription(`{lang:${cmd.lang}.possible|${msg.author.id}|${Internal.extraArgParsing(msg)}}`)
				.setImage(img.url)
				.setTimestamp(new Date().toISOString())
				.setFooter("OwO", this.bot.user.avatarURL)
				.setColor(Colors.gold)
				.toJSON()
		});
	});
