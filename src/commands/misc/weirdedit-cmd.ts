import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Redis from "../../util/Redis";
import CommandError from "../../util/cmd/CommandError";
import Language from "../../util/Language";

export default new Command(["weirdedit"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const char = "\u202B";
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		const p = msg.args.join(" ").split(",");
		if (!p[0]) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missing1`));
		if (!p[1]) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missing2`));

		const m = await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.edited`));
		await m.edit(`${p[0]} ${char}${char} ${p[1]} ${char}${char}`);
	});
