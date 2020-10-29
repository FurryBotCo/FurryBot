import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import FurryBotAPI from "../../util/req/FurryBotAPI";

export default new Command(["bal", "balance"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([
		"beta",
		"developer"
	])
	.setCooldown(6e4, false)
	.setDonatorCooldown(3e4)
	.setExecutor(async function (msg, cmd) {
		const m = msg.args.length === 0 ? msg.member : await msg.getMemberFromArgs();

		return msg.channel.createMessage({
			embed:
				new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.${m.id === msg.author.id ? "self" : "other"}|${m.tag}}`)
					.setDescription(`${msg.uConfig.eco.bal} ${msg.gConfig.settings.ecoEmoji}`)
					.setTimestamp(new Date().toISOString())
					.setAuthor(m.tag, m.avatarURL)
					.setColor(Colors.gold)
					.toJSON()
		});
	});
