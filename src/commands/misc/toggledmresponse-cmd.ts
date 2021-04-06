import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { Command } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["toggledmresponse"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		await msg.uConfig.edit({
			dmResponse: !msg.uConfig.dmResponse
		});

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.${msg.uConfig.dmResponse === true ? "on" : "off"}`));
	});
