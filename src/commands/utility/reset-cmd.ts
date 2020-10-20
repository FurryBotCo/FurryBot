import config from "../../config";
import Command from "../../util/cmd/Command";
import Language from "../../util/Language";
import Logger from "../../util/Logger";

export default new Command(["reset", "resetsettings"], __filename)
	.setBotPermissions([])
	.setUserPermissions([
		"administrator"
	])
	.setRestrictions([])
	.setCooldown(36e5, true)
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
				await msg.gConfig.reset().then(d => d.reload());
			} catch (e) {
				Logger.error(`Shard #${msg.channel.guild.shard.id}`, e);
				return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.error`));
			}
		}
	});
