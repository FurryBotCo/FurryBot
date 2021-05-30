import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Colors, Command, EmbedBuilder } from "core";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["makeinv"], __filename)
	.setBotPermissions([
		"createInstantInvite"
	])
	.setUserPermissions([
		"createInstantInvite"
	])
	.setRestrictions([])
	.setCooldown(5e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.helpTitle}`)
				.setDescription([
					`{lang:${cmd.lang}.helpDesc}`,
					`{lang:${cmd.lang}.helpUsage}:`,
					`{lang:${cmd.lang}.perm}: \`${msg.prefix}makeinv <#channel>\``,
					`{lang:${cmd.lang}.temp}: \`${msg.prefix}makeinv <#channel> -t\``,
					`{lang:${cmd.lang}.maxAge}: \`${msg.prefix}makeinv <#channel> --maxAge=<seconds>\``,
					`{lang:${cmd.lang}.maxUses}: \`${msg.prefix}makeinv <#channel> --maxUses=<number>\``
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.red)
				.toJSON()
		});

		const a = msg.dashedArgs;
		let ch: Eris.GuildTextableChannel | null;
		if (msg.args.length > 0) ch = await msg.getChannelFromArgs();
		else ch = msg.channel;

		if (ch === null) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL", true)
		});

		const inv = await ch.createInvite({
			unique: true,
			temporary: a.value.includes("t"),
			maxAge: Object.keys(a.keyValue).includes("maxAge") ? Number(a.keyValue.maxAge) : 0,
			maxUses: Object.keys(a.keyValue).includes("maxUses") ? Number(a.keyValue.maxUses) : 0
		}, encodeURIComponent(`Makeinv: ${msg.author.tag} (${msg.author.id})`));

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTitle(`{lang:${cmd.lang}.created}`)
				.setDescription([
					`{lang:${cmd.lang}.code}: [${inv.code}](https://discord.gg/${inv.code})`,
					`{lang:${cmd.lang}.temporary}: ${inv.temporary ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}`,
					`{lang:${cmd.lang}.maxAge}: ${inv.maxAge || "{lang:other.words.none$upper$}"}`,
					`{lang:${cmd.lang}.maxUses}: ${inv.maxUses || "{lang:other.words.none$upper$}"}`,
					`{lang:${cmd.lang}.channel}: <#${inv.channel.id}>`
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.green)
				.toJSON()
		});
	});
