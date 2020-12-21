import Command from "../../util/cmd/Command";
import Language from "../../util/Language";

export default new Command(["prefix"], __filename)
	.setBotPermissions([])
	.setUserPermissions([
		"manageGuild"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.current`, [msg.gConfig.settings.prefix]));
		if (msg.args.join("").toLowerCase() === msg.gConfig.settings.prefix.toLowerCase()) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.same`));
		if ([`<@!${this.bot.user.id}>`, `<@${this.bot.user.id}>`].some(t => msg.args.join("").toLowerCase() === t.toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`, [msg.args.join("").toLowerCase()]));
		if (msg.args.join("").length > 15) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.maxLen`));
		await msg.gConfig.edit({ settings: { prefix: msg.args.join("").toLowerCase() } }).then(d => d.reload());
		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set`, [msg.args.join("").toLowerCase()]));
	});
