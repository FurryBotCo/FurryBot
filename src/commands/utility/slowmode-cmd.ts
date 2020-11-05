import Eris from "eris";
import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";

export default new Command(["slowmode"], __filename)
	.setBotPermissions([
		"manageChannels"
	])
	.setUserPermissions([
		"manageChannels"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		const s = Number(msg.args[0]);
		if (isNaN(s) || s < 0 || s > 21600) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));
		const ch = msg.args.length > 1 ? await msg.getChannelFromArgs<Eris.TextChannel>(1) : msg.channel;
		if (!ch) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL", true)
		});
		if (s === ch.rateLimitPerUser) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unchanged`, [ch.id]));

		await ch.edit({ rateLimitPerUser: s }, encodeURIComponent(`slowmode command: ${msg.author.tag} (${msg.author.id})`));

		return msg.reply(s === 0 ? Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove`, [ch.id]) : Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set`, [ch.id, s, s === 1 ? "OwO" : "s"]));
	});
