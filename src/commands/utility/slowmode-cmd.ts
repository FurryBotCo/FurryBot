import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command, CommandError } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["slowmode", "slow"], __filename)
	.setBotPermissions([
		"kickMembers"
	])
	.setUserPermissions([
		"manageChannels"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		const s = Number(msg.args[0]);
		if (isNaN(s) || s < 0 || s > 21600) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));
		const ch = msg.args.length > 1 ? await msg.getChannelFromArgs(1) : msg.channel;
		if (!ch) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL", true)
		});
		if (s === ch.rateLimitPerUser) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unchanged`, [ch.id]));

		await ch.edit({ rateLimitPerUser: s }, encodeURIComponent(`slowmode command: ${msg.author.tag} (${msg.author.id})`));

		return msg.reply(s === 0 ? Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove`, [ch.id]) : Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set`, [ch.id, s, s === 1 ? "OwO" : "s"]));
	});
