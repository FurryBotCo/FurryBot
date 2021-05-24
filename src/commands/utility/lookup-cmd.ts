import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import config from "../../config";
import { Command, EmbedBuilder, CommandError, Colors, defaultEmojis } from "core";
import Language from "language";
import fetch from "node-fetch";
import { APIGuildWidget } from "discord-api-types";
import { Time } from "utilities";

export default new Command<FurryBot, UserConfig, GuildConfig>(["lookup"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);

		// According to Discord's developers, ids can *techincally* be between 15 and 21 numbers.
		if (msg.args[0].length < 15 || msg.args.length > 21) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));

		const w = await fetch(`https://discord.com/api/guilds/${msg.args[0]}/widget.json`, {
			method: "GET",
			headers: {
				"Authorization": `Bot ${config.client.token}`,
				"User-Agent": config.web.userAgent
			}
		}).then(async(res) => {
			let b: Buffer, j: APIGuildWidget;
			try {
				b = await res.buffer();
				j = JSON.parse(b.toString()) as APIGuildWidget;
			} catch (e) {
				throw new Error("failed to parse response");
			}

			return {
				statusCode: res.status,
				statusMessage: res.statusText,
				body: j
			};
		});

		switch (w.statusCode) {
			case 200: {
				const embed = new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.found}`)
					.setDescription(`{lang:${cmd.lang}.foundDesc|${msg.args[0]}}`)
					.setColor(Colors.green)
					.setTimestamp(new Date().toISOString());

				const [, code] = w.body.instant_invite?.match(new RegExp("^(?:(?:https?://)?(?:discord.gg|discord(?:app)?.com/invite)/)?([A-Za-z0-9]{2,32})$", "i")) ?? [];
				const inv = !code ? null : (await this.client.getInvite(code, true).catch(() => null));
				if (!inv) {
					embed.addField(
						"{lang:other.words.info$ucwords$}",
						[
							`${defaultEmojis.dot} {lang:${cmd.lang}.serverName}: ${w.body.name}`,
							`${defaultEmojis.dot} {lang:${cmd.lang}.creation}: ${Time.formatDateWithPadding(new Date(Number(BigInt(w.body.id) / 4194304n + 1420070400000n)), true)}`,
							`${defaultEmojis.dot} {lang:${cmd.lang}.list}: ${w.body.presence_count}`,
							`${defaultEmojis.dot} \t<:${config.emojis.status.online}> ${w.body.members.filter(m => m.status === "online").length}`,
							`${defaultEmojis.dot} \t<:${config.emojis.status.idle}> ${w.body.members.filter(m => m.status === "idle").length}`,
							`${defaultEmojis.dot} f!help\t<:${config.emojis.status.dnd}> ${w.body.members.filter(m => m.status === "dnd").length}`
						].join("\n"),
						false
					);
				} else {
					const { guild, inviter, channel } = inv;
					embed.addField(
						`{lang:${cmd.lang}.srvChInfo}`,
						[
							"**{lang:other.words.extra$ucwords$}**:",
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
						].join("\n"),
						false
					);

					if (inviter) {
						embed.addField(
							"{lang:other.words.inviter$ucwords$}",
							[
								`{lang:other.words.name$ucwords$}: ${inviter.username}#${inviter.discriminator}`,
								`{lang:other.words.id$ucwords$}: ${inviter.id}`,
								`{lang:other.words.bot$ucwords$}: ${inviter.bot ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}`,
								`{lang:other.words.system$ucwords$}: ${inviter.system ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}`
							].join("\n"),
							false
						);
						embed.setThumbnail(inviter.avatarURL);
					}

					embed.setAuthor(...(!guild ? ["{lang:other.words.unknown$ucwords$}", "https://i.furry.bot/noicon.png"] : [guild.name, !guild.icon ? "https://i.furry.bot/noicon.png" : `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`]) as [string, string]);
				}

				return msg.channel.createMessage({
					embed: embed.toJSON()
				});
				break;
			}

			case 403:
				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle(`{lang:${cmd.lang}.found}`)
						.setDescription(`{lang:${cmd.lang}.foundDesc|${msg.args[0]}} {lang:${cmd.lang}.noInfo}`)
						.setColor(Colors.orange)
						.setTimestamp(new Date().toISOString())
						.toJSON()
				});
				break;

			case 404:
				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle(`{lang:${cmd.lang}.notFound}`)
						.setDescription(`{lang:${cmd.lang}.notFoundDesc|${msg.args[0]}}`)
						.setColor(Colors.red)
						.setTimestamp(new Date().toISOString())
						.toJSON()
				});
				break;

			default:
				console.error(w.body);
				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle(`{lang:${cmd.lang}.discordError}`)
						.setDescription(`{lang:${cmd.lang}.discordErrorDesc|${w.statusCode}|${w.statusMessage}}`)
						.setColor(Colors.red)
						.setTimestamp(new Date().toISOString())
						.toJSON()
				});
		}
	});
