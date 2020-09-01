import Eris from "eris";
import config from "../../../config";
import Command from "../../../util/cmd/Command";
import CommandError from "../../../util/cmd/CommandError";
import { ChannelNames, Colors } from "../../../util/Constants";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Time from "../../../util/Functions/Time";
import Language from "../../../util/Language";
import phin from "phin";

export default new Command(["lookup"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);

		// According to Discord's developers, ids can *techincally* be between 15 and 21 numbers.
		if (msg.args[0].length < 15 || msg.args.length > 21) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));

		const w = await phin<any>({
			method: "GET",
			url: `https://discordapp.com/api/guilds/${msg.args[0]}/widget.json`,
			headers: {
				"Authorization": `Bot ${config.client.token}`,
				"User-Agent": config.web.userAgent
			},
			parse: "json"
		});

		switch (w.statusCode) {
			case 200:
				const embed = new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.found}`)
					.setDescription(`{lang:${cmd.lang}.foundDesc|${msg.args[0]}}`)
					.setColor(Colors.green)
					.setTimestamp(new Date().toISOString());

				const code = w.body.instant_invite.match(new RegExp("^((https?\:\/\/)?(discord\.gg|discordapp\.com\/invite)\/)?([A-Za-z0-9]{2,32})$", "i"))[4];
				const inv = (await this.bot.getInvite(code, true).catch(err => null)) as Eris.RESTChannelInvite;
				if (!inv) {
					embed.addField(
						"{lang:other.words.info}",
						[
							`${config.emojis.default.dot} {lang:${cmd.lang}.serverName}: ${w.body.name}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.creation}: ${Time.formatDateWithPadding(new Date(Number(BigInt(w.body.id) / 4194304n + 1420070400000n)), true)}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.list}: ${w.body.presence_count}`,
							`\t<:${config.emojis.status.online}> ${w.body.members.filter(m => m.status === "online").length}`,
							`\t<:${config.emojis.status.idle}> ${w.body.members.filter(m => m.status === "idle").length}`,
							`\t<:${config.emojis.status.dnd}> ${w.body.members.filter(m => m.status === "dnd").length}`
						].join("\n"),
						false
					);
				} else {
					const { guild, inviter, channel } = inv;
					embed.addField(
						`{lang:${cmd.lang}.srvChInfo}`,
						[
							`**{lang:${cmd.lang}.extra}**:`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.code}: [${inv.code}](https://discord.gg/${inv.code})`,
							"",
							`**{lang:${cmd.lang}.server}**:`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.serverName}: [${guild.name}](https://discord.gg/${inv.code})`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.serverId}: ${guild.id}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.memberCount}: ${inv.memberCount || "{lang:other.words.unknown}"}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.presenceCount}: ${inv.presenceCount || "{lang:other.words.unknown}"}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.vanityURLCode}: ${inv.guild.vanityUrlCode || "{lang:other.words.none}"}`,
							"",
							`**{lang:${cmd.lang}.channel}**:`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.channelName}: ${channel.name}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.channelId}: ${channel.id}`,
							`${config.emojis.default.dot} {lang:${cmd.lang}.channelType}: ${ChannelNames[channel.type]}`
						].join("\n"),
						false
					);

					if (inviter) {
						embed.addField(
							`{lang:${cmd.lang}.inviter}`,
							[
								`{lang:${cmd.lang}.name}: ${inviter.username}#${inviter.discriminator}`,
								`{lang:${cmd.lang}.id}: ${inviter.id}`,
								`{lang:${cmd.lang}.bot}: ${inviter.bot ? "{lang:other.words.yes}" : "{lang:other.words.no}"}`,
								`{lang:${cmd.lang}.system}: ${inviter.system ? "{lang:other.words.yes}" : "{lang:other.words.no}"}`
							].join("\n"),
							false
						);
						embed.setThumbnail(inviter.avatarURL);
					}

					embed.setAuthor(guild.name, !guild.icon ? "https://i.furcdn.net/noicon.png" : `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`);
				}

				return msg.channel.createMessage({
					embed: embed.toJSON()
				});
				break;

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
