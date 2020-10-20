import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Internal from "../../util/Functions/Internal";

export default new Command(["whosagoodboi", "whosagoodboy", "goodboi", "goodboy"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.${msg.args.length === 0 ? "me" : "other"}|${Internal.extraArgParsing(msg)}}`)
				.setTimestamp(new Date().toISOString())
				.setFooter("OwO", this.bot.user.avatarURL)
				.setColor(Colors.gold)
				.toJSON()
		});
	});
