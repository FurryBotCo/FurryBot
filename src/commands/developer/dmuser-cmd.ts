import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import { BotFunctions, Colors, Command, CommandError, EmbedBuilder } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["dmuser"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([
		"developer"
	])
	.setCooldown(0, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 2) return new CommandError("INVALID_USAGE", cmd);

		const u = await msg.getUserFromArgs();

		if (!u) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(config.devLanguage, "INVALID_USER", true)
		});

		const ch = await u.getDMChannel();

		await ch.createMessage({
			embed: new EmbedBuilder(config.devLanguage)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setColor(Colors.gold)
				.setTimestamp(new Date().toISOString())
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription(msg.args.slice(1).join(" "))
				.toJSON()
		})
			.then(() => msg.channel.createMessage(Language.get(config.devLanguage, `${cmd.lang}.success`, [`${u.username}#${u.discriminator}`])))
			.catch((err: Error) => msg.channel.createMessage(Language.get(config.devLanguage, `${cmd.lang}.failure`, [`${err.name}: ${err.message}`])));
	});
