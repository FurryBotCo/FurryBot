import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Colors, Command, CommandError, defaultEmojis, EmbedBuilder } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["inviteinfo", "invinfo"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		const [, code] = /^(?:(?:https?:\/\/)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/)?([A-Za-z0-9]{2,32})$/i.exec(msg.args.join(""))?? [];

		if (!code) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noInv`));

		// https://github.com/microsoft/TypeScript/issues/43249
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const inv = (await this.bot.getInvite(code , true).catch(() => null));
		if (!inv) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));
		const { guild, inviter, channel } = inv;

		const embed = new EmbedBuilder(msg.gConfig.settings.lang)
			.setTitle(`{lang:${cmd.lang}.title}`)
			.setColor(Colors.furry)
			.setAuthor(...(!guild ? ["{lang:other.words.unknown$ucwords$}", "https://i.furry.bot/noicon.png"] : [guild.name, !guild.icon ? "https://i.furry.bot/noicon.png" : `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`]) as [string, string])
			.addField(`{lang:${cmd.lang}.info}`, [
				`**{lang:${cmd.lang}.extra}**:`,
				`${defaultEmojis.dot} {lang:${cmd.lang}.code}: [${inv.code}](https://discord.gg/${inv.code})`,
				...(guild ? [
					"",
					`**{lang:${cmd.lang}.server}**:`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.serverName}: [${guild.name}](https://discord.gg/${inv.code})`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.serverId}: ${guild.id}`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.memberCount}: ${inv.memberCount || "{lang:other.words.unknown$ucwords$}"}`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.presenceCount}: ${inv.presenceCount || "{lang:other.words.unknown$ucwords$}"}`
					// Eris fucked it up
					// `${defaultEmojis.dot} {lang:${cmd.lang}.vanityURLCode}: ${guild.vanityUrlCode || "{lang:other.words.none$upper$}"}`,
				] : []),
				...(channel ? [
					"",
					`**{lang:${cmd.lang}.channel}**:`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.channelName}: ${channel.name || ""}`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.channelId}: ${channel.id}`,
					`${defaultEmojis.dot} {lang:${cmd.lang}.channelType}: {lang:other.channelType.${channel.type}$ucwords$}`
				] : [])
			].join("\n"), false);

		if (inviter) {
			embed.addField(
				`{lang:${cmd.lang}.inviter}`,
				[
					`{lang:${cmd.lang}.name}: ${inviter.username}#${inviter.discriminator}`,
					`{lang:${cmd.lang}.id}: ${inviter.id}`,
					`{lang:${cmd.lang}.bot}: ${inviter.bot ? "{lang:other.words.yes}" : "{lang:other.words.no}"}`,
					`{lang:${cmd.lang}.system}: ${inviter.system ? "{lang:other.words.yes}" : "{lang:other.words.no}"}`
				].join("\n"),
				false);
			embed.setThumbnail(inviter.avatarURL);
		}
		return msg.channel.createMessage({
			embed: embed.toJSON()
		});
	});
