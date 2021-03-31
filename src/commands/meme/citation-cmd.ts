import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import LocalFunctions from "../../util/LocalFunctions";
import { Command } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["citation"], __filename)
	.setBotPermissions([
		"attachFiles",
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		return LocalFunctions.handleMemeCommand("text", msg, cmd);
	});
