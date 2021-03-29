import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import { Colors, Command, CommandError, EmbedBuilder } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["8ball"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(2e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title|${msg.author.tag}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.said}: **{lang:${cmd.lang}.possible}**.`)
				.setFooter(`{lang:${cmd.lang}.disclaimer}`, config.images.icons.bot)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.toJSON()
		});
	});
