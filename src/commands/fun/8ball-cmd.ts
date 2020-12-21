import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import CommandError from "../../util/cmd/CommandError";

export default new Command(["8ball"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title|${msg.author.tag}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.said}: **{lang:${cmd.lang}.possible}**.`)
				.setFooter(`{lang:${cmd.lang}.disclaimer}`, this.bot.user.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.toJSON()
		});
	});
