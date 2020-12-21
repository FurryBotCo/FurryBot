import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import Utility from "../../util/Functions/Utility";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import config from "../../config";
import Language from "../../util/Language";

export default new Command(["dmuser"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions(["developer"])
	.setCooldown(0, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 2) return new CommandError("ERR_INVALID_USAGE", cmd);

		const u = await msg.getUserFromArgs();

		if (!u) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(config.devLanguage, "INVALID_USER")
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(Colors.red)
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});

		const ch = await u.getDMChannel();

		await ch.createMessage({
			embed: new EmbedBuilder(config.defaults.config.guild.settings.lang as any)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(Colors.gold)
				.setTimestamp(new Date().toISOString())
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription(msg.args.slice(1).join(" "))
				.toJSON()
		})
			.then(() => msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(config.defaults.config.guild.settings.lang as any, `${cmd.lang}.success`, [`${u.username}#${u.discriminator}`])}`))
			.catch(err => msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(config.defaults.config.guild.settings.lang as any, `${cmd.lang}.failure`, [`${err.name}: ${err.message}`])}`));
	});
