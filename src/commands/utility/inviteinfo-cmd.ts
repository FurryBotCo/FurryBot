import Eris from "eris";
import config from "../../config";
import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import { ChannelNames, Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Language from "../../util/Language";

export default new Command(["inviteinfo", "invinfo"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		const [, code] = msg.args.join("").match(new RegExp("^(?:(?:https?\:\/\/)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/)?([A-Za-z0-9]{2,32})$", "i")) ?? [];

		if (!code) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noInv`));

		const inv = (await this.bot.getInvite(code, true).catch(err => null));
		if (!inv) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));
		const { guild, inviter, channel } = inv;

		const embed = new EmbedBuilder(msg.gConfig.settings.lang)
			.setTitle(`{lang:${cmd.lang}.title}`)
			.setColor(Colors.green)
			.setAuthor(guild.name, !guild.icon ? "https://i.furcdn.net/noicon.png" : `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`)
			.addField(`{lang:${cmd.lang}.info}`, [
				`**{lang:${cmd.lang}.extra}**:`,
				`${config.emojis.default.dot} {lang:${cmd.lang}.code}: [${inv.code}](https://discord.gg/${inv.code})`,
				"",
				`**{lang:${cmd.lang}.server}**:`,
				`${config.emojis.default.dot} {lang:${cmd.lang}.serverName}: [${guild.name}](https://discord.gg/${inv.code})`,
				`${config.emojis.default.dot} {lang:${cmd.lang}.serverId}: ${guild.id}`,
				`${config.emojis.default.dot} {lang:${cmd.lang}.memberCount}: ${inv.memberCount || "{lang:other.words.unknown$ucwords$}"}`,
				`${config.emojis.default.dot} {lang:${cmd.lang}.presenceCount}: ${inv.presenceCount || "{lang:other.words.unknown$ucwords$}"}`,
				`${config.emojis.default.dot} {lang:${cmd.lang}.vanityURLCode}: ${inv.guild.vanityUrlCode || "{lang:other.words.none$upper$}"}`,
				"",
				`**{lang:${cmd.lang}.channel}**:`,
				`${config.emojis.default.dot} {lang:${cmd.lang}.channelName}: ${channel.name}`,
				`${config.emojis.default.dot} {lang:${cmd.lang}.channelId}: ${channel.id}`,
				`${config.emojis.default.dot} {lang:${cmd.lang}.channelType}: ${ChannelNames[channel.type]}`
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
