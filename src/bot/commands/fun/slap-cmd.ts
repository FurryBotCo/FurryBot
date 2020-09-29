import Command from "../../../util/cmd/Command";
import CommandError from "../../../util/cmd/CommandError";
import { Colors } from "../../../util/Constants";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Internal from "../../../util/Functions/Internal";

export default new Command(["slap"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.possible|${msg.author.id}|${Internal.extraArgParsing(msg)}}`)
				.setTimestamp(new Date().toISOString())
				.setFooter("OwOthis.bot.user.avatarURL)
					.setColor(Colors.gold)
					.toJSON()
		});
	});
