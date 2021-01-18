import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import DankMemerAPI from "../../util/req/DankMemerAPI";

export default new Command(["yomomma"], __filename)
	.setBotPermissions([
		"attachFiles",
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const v = await DankMemerAPI.yomomma();
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setTimestamp(new Date().toISOString())
				.setDescription(v)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("dankmemer.services", msg.client.bot.user.avatarURL)
				.setColor(Colors.gold)
				.toJSON()
		});
	});
