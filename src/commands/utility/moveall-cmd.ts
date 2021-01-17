import config from "../../config";
import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import { ChannelNames, Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Time from "../../util/Functions/Time";
import Language from "../../util/Language";
import phin from "phin";
import Utility from "../../util/Functions/Utility";
import Eris from "eris";

export default new Command(["moveall"], __filename)
	.setBotPermissions([
		"voiceMoveMembers"
	])
	.setUserPermissions([
		"voiceMoveMembers"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 2) return new CommandError("ERR_INVALID_USAGE", cmd);

		const from = await msg.getChannelFromArgs<Eris.VoiceChannel>(0, true, 0);
		const to = await msg.getChannelFromArgs<Eris.VoiceChannel>(1, true, 1);

		if (!from || !to) return msg.reply({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL", true)
		});

		if ([from.type, to.type].some(v => v !== Eris.Constants.ChannelTypes.GUILD_VOICE)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notVoice`));
		const perms: ErisPermissions[] = [
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

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [o, from.name, to.name]));
	});
