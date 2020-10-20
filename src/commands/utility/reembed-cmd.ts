import Command from "../../util/cmd/Command";
import Language from "../../util/Language";
import Eris from "eris";
import CommandError from "../../util/cmd/CommandError";

export default new Command(["reembed"], __filename)
	.setBotPermissions([
		"manageMessages"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);

		let id: string, g: string, ch: string, m: RegExpMatchArray;

		// could possibly do destructuring, but this works
		if (
			(m = msg.args[0].match(/^https?:\/\/(?:canary|ptb)?\.discord(?:app)?\.com\/channels\/([0-9]{15,21})\/([0-9]{15,21})\/([0-9]{15,21})$/))
		) (g = m[1], ch = m[2], id = m[3]);

		if (!id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noId`));
		if (!g) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidGuild`));

		const channel = await msg.channel.guild.channels.get(ch) as Eris.GuildTextableChannel;

		if (!channel || ![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(channel.type)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidChannel`));

		const message = await channel.getMessage(id).catch(null) as Eris.Message & { flags: number; };

		if (!message) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidMessage`));
		if (!(message.flags & Eris.Constants.MessageFlags.SUPPRESS_EMBEDS)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notSuppressed`));

		// may not work in prod due to some weird way Eris works?
		await message.edit({ flags: message.flags - Eris.Constants.MessageFlags.SUPPRESS_EMBEDS });

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unsuppressed`));
	});
