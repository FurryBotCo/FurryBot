import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command, CommandError, ErisPermissions } from "core";
import Eris from "eris";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["moveall"], __filename)
	.setBotPermissions([
		"voiceMoveMembers"
	])
	.setUserPermissions([
		"voiceMoveMembers"
	])
	.setRestrictions([])
	.setCooldown(1.5e4, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 2) return new CommandError("INVALID_USAGE", cmd);

		const from = await msg.getChannelFromArgs<Eris.VoiceChannel>(0, true, 0, true);
		const to = await msg.getChannelFromArgs<Eris.VoiceChannel>(1, true, 1, true);

		if (!from || !to) return msg.reply({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL", true)
		});

		if ([from.type, to.type].some(v => ![Eris.Constants.ChannelTypes.GUILD_VOICE, Eris.Constants.ChannelTypes.GUILD_STAGE].includes(v))) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notVoice`));
		const perms: Array<ErisPermissions> = [
				"voiceConnect",
				"voiceMoveMembers"
			],
			a = to.permissionsOf(msg.author.id),
			b = to.permissionsOf(this.bot.user.id),
			// cloning the value
			o = Number(from.voiceMembers.size);

		for (const p of perms) {
			if (!a.has(p)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.youNoAccess`, [p]));
			if (!b.has(p)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.meNoAccess`, [p]));
		}

		await Promise.all(from.voiceMembers.map(async (m) => m.edit({
			channelID: to.id
		})));

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [o, from.id, to.id]));
	});
