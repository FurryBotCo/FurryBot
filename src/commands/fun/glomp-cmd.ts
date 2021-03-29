import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import LocalFunctions from "../../util/LocalFunctions";
import { Command } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["glomp"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		return LocalFunctions.genericFunCommand.call(this, msg, cmd);
	});
