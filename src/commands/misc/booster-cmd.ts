import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import config from "../../config";
import { Command } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["booster"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([
		"supportServer"
	])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (!msg.member.roles.includes(config.roles.booster)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notABooster`));
		const c = await msg.uConfig.checkPremium(true);
		if (c.active) {
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyActive`));
		}

		await msg.uConfig.edit({
			booster: true
		});

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`));
	});
