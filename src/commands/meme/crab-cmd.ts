import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import DankMemerAPI from "../../util/req/DankMemerAPI";
import { BotFunctions, Command, CommandError } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["crab"], __filename)
	.setBotPermissions([
		"attachFiles",
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) return new CommandError("INVALID_USAGE", cmd);
		await msg.channel.startTyping();
		const { ext, file } = await DankMemerAPI.crab(BotFunctions.memeArgParsing(msg));
		await msg.channel.stopTyping();
		// because slash command messages don't support file uploads
		if (msg.slash) await msg.reply("\u200B");
		return msg.channel.createMessageNoSlash({}, {
			name: `${cmd.triggers[0]}.${ext}`,
			file
		});
	});
