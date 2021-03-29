import FurryBot from "../../main";
import LocalFunctions from "../../util/LocalFunctions";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Command } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["hug"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		return LocalFunctions.genericFunCommandWithImage.call(this, msg, cmd, "hug");
	});
