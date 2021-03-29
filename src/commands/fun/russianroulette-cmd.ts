import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Command } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["russianroulette", "rr"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const val = Math.floor(Math.random() * 6);
		const bullets = typeof msg.args[0] !== "undefined" ? parseInt(msg.args[0], 10) : 3;

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.${val <= bullets - 1 ? "die" : "live"}`));
	});
