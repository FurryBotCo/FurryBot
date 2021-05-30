import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import config from "../../config";
import { Command } from "core";
import Language from "language";
import Logger from "logger";

export default new Command<FurryBot, UserConfig, GuildConfig>(["reset", "resetsettings"], __filename)
	.setBotPermissions([])
	.setUserPermissions([
		"administrator"
	])
	.setRestrictions([])
	.setCooldown(1.5e4, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.confirm`));
		const d = await this.col.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id);
		if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));
		const choice = d.content.toLowerCase() === "yes";

		if (!choice) {
			return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.canceled`));
		} else {
			await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [config.defaults.prefix]));
			try {
				await msg.gConfig.reset().then(v => v.reload());
			} catch (e) {
				Logger.error(`Shard #${msg.channel.guild.shard.id}`, e);
				return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.error`));
			}
		}
	});
