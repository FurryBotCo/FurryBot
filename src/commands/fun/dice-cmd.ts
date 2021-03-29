import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Command } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["dice"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const min = typeof msg.args[0] !== "undefined" ? Number(msg.args[0]) : 1;
		const max = typeof msg.args[1] !== "undefined" ? Number(msg.args[1]) : 20;

		if (min > max) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.minLess`));
		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.text`, [Math.floor(Math.random() * (max - min)) + min]));
	});
