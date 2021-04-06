import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { Command, CommandError } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["weirdedit"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const char = "\u202B";
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		const p = msg.args.join(" ").split(",");
		if (!p[0]) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missing1`));
		if (!p[1]) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missing2`));

		const m = await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.edited`));
		await m.edit(`${p[0]} ${char}${char} ${p[1]} ${char}${char}`);
	});
