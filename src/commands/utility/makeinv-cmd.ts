import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import Language from "../../util/Language";
import chunk from "chunk";
import Eris from "eris";
import { Colors } from "../../util/Constants";

export default new Command(["makeinv"], __filename)
	.setBotPermissions([
		"createInstantInvite"
	])
	.setUserPermissions([
		"createInstantInvite"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.helpTitle}`)
				.setDescription([
					`{lang:${cmd.lang}.helpDesc}`,
					`{lang:${cmd.lang}.helpUsage}:`,
					`{lang:${cmd.lang}.temp}: \`${msg.gConfig.settings.prefix}makeinv -t\``,
					`{lang:${cmd.lang}.maxAge}: \`${msg.gConfig.settings.prefix}makeinv --maxAge=<seconds>\``,
					`{lang:${cmd.lang}.maxUses}: \`${msg.gConfig.settings.prefix}makeinv --maxUses=<number>\``
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.red)
				.toJSON()
		});

		const a = msg.dashedArgs;
		let ch: Eris.GuildTextableChannel;
		if (msg.args.length > 0) ch = await msg.getChannelFromArgs();
		else ch = msg.channel;

		if (!ch) ch = msg.channel;

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
