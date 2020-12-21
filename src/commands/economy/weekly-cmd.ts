import config from "../../config";
import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command(["weekly"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([
		"beta",
		"donator",
		"developer"
	])
	.setCooldown(8.64e+7, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		await msg.uConfig.edit({
			eco: {
				bal: msg.uConfig.eco.bal + config.eco.amounts.weekly
			}
		});

		return msg.channel.createMessage({
			embed:
				new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setDescription(`{lang:${cmd.lang}.desc|${config.eco.amounts.weekly}|${msg.gConfig.settings.ecoEmoji}}`)
					.setTimestamp(new Date().toISOString())
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setColor(Colors.gold)
					.toJSON()
		});
	});
