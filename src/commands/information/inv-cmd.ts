import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import { Colors, Command, EmbedBuilder } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["inv", "invite", "discord", "support"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle("Discord")
				.setDescription(`[{lang:${cmd.lang}.support}](${config.client.socials.discord})\n[{lang:${cmd.lang}.add}](${config.client.socials.discordInvite})`)
				.setThumbnail(this.bot.user.avatarURL)
				.setColor(Colors.furry)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("OwO", this.bot.user.avatarURL)
				.toJSON()
		});
	});
