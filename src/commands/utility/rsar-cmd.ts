import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["rsar"], __filename)
	.setBotPermissions([])
	.setUserPermissions([
		"manageRoles"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const role = await msg.getRoleFromArgs();
		if (!role) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_ROLE", true)
		});
		if (!msg.gConfig.selfAssignableRoles.includes(role.id)) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notListed`));
		await msg.gConfig.mongoEdit({ $pull: { selfAssignableRoles: role.id } });
		return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.removed`, [role.name]));
	});
