import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import { number } from "yargs";
import config from "../../../config";

export default new Command(["invite", "inv", "discord"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle("Discord")
				.setDescription(`[Support Server](${config.client.socials.discord})\n[Add Me To A Server](${config.client.socials.discordInvite})`)
				.setThumbnail(this.bot.user.avatarURL)
				.setColor(Colors.green)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("\u200b", this.bot.user.avatarURL)
				.toJSON()
		});
	});
