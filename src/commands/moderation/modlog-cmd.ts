import Eris from "eris";
import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";
import chunk from "chunk";
import { mdb } from "../../util/Database";
import Strings from "../../util/Functions/Strings";
import Time from "../../util/Functions/Time";
import config from "../../config";

export default new Command(["modlog"], __filename)
	.setBotPermissions([
		"manageWebhooks"
	])
	.setUserPermissions([
		"manageGuild"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd, "NONE_PROVIDED");

		switch (msg.args[0].toLowerCase()) {
			case "set": {
				const ch = await msg.getChannelFromArgs(1, true, 0);
				if (!ch) return msg.channel.createMessage({
					embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL", true)
				});

				// could do a some but I want to send the perm to the user
				for (const p of ["readMessages", "sendMessages"]) {
					if (!ch.permissionsOf(this.bot.user.id).has(p)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set.missingPermission`, [ch.id, p]));
				}

				await ch.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle(`{lang:${cmd.lang}.set.title}`)
						.setDescription(`{lang:${cmd.lang}.set.desc}`)
						.setColor(Colors.gold)
						.setTimestamp(new Date().toISOString())
						.setAuthor(`${this.bot.user.username}#${this.bot.user.discriminator}`, this.bot.user.avatarURL)
						.toJSON()
				});

				await msg.gConfig.edit({
					modlog: {
						enabled: true,
						channel: ch.id
					}
				});

				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.set.done`, [ch.id]));
				break;
			}

			case "disable": {
				if (!msg.gConfig.modlog.enabled) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.disable.notEnabled`));

				await msg.gConfig.edit({
					modlog: {
						enabled: false,
						channel: null
					}
				});

				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.disable.done`));
				break;
			}

			case "list": {
				const dev = msg.dashedArgs.value.includes("dev");
				if (dev && !config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.devOnlyFlag`));
				const user = msg.args.length === 1 ? msg.author : await msg.getUserFromArgs(1, true, 0);
				if (!user) return msg.channel.createMessage({
					embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER", true)
				});

				const page = msg.args.length < 3 ? 1 : Number(msg.args[2]);
				const entries = await mdb.collection<ModLogEntry.GenericEntry>("modlog").find({
					target: user.id,
					guildId: msg.channel.guild.id,
					type: {
						$in: [
							"warn",
							"kick",
							"unban",
							"unmute",
							"softban",
							"ban",
							"mute"
						]
					}
				}).toArray();
				const pages = chunk(entries, 6);
				if (pages.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.noEntries`));
				if (page > pages.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.invalidPage`, [page, pages.length]));
				const e = pages[page - 1];
				let i = 0;

				const em = new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.list.title|${user.username}#${user.discriminator}}`)
					.setDescription(`{lang:${cmd.lang}.list.note}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter(`{lang:${cmd.lang}.list.footer|${page}|${pages.length}|${entries.length}}`, this.bot.user.avatarURL)
					.setColor(Colors.gold)
					.setTimestamp(new Date().toISOString());

				for (const v of e) {
					i++;
					const u: Eris.User | null = v.blame === "automatic" ? this.bot.user : await this.bot.users.get(v.blame) || await this.getUser(v.blame).catch(err => null);

					em.addField(`{lang:${cmd.lang}.list.name|${v.pos}}`, [
						`{lang:other.words.type$ucwords$}: **${Strings.ucwords(v.type)}**`,
						`{lang:other.words.blame$ucwords$}: **${!u ? "{lang:other.words.unknown$ucwords$}" : `${u.username}#${u.discriminator}`}**`,
						`{lang:other.words.time$ucwords$}: **${!v.creationDate ? `{lang:${cmd.lang}.list.legacy}` : Time.formatDateWithPadding(v.creationDate)}**`,
						`{lang:other.words.reason$ucwords$}: ${v.reason}`,
						...(dev ? [
							`Internal ID: \`${v._id}\``
						] : [])
					].join("\n"), true);

					if ((i % 2) !== 0) em.addEmptyField(true);
				}

				return msg.channel.createMessage({
					embed: em.toJSON()
				});
				break;
			}

			// not implementing this yet
			/* case "clear": {
				break;
			}*/

			default: return new CommandError("ERR_INVALID_USAGE", cmd, "INVALID_SUBCOMMAND");
		}
	})
	.setOverride("invalidUsage", async function (msg, cmd, err) {
		switch (err.extra) {
			case "NONE_PROVIDED":
			case "INVALID_SUBCOMMAND": {
				await msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setTitle("\u274c {lang:other.words.invalid$ucwords$} {lang:other.words.usage$ucwords$}")
						.setDescription([
							`{lang:${cmd.lang}.help.main}`,
							`{lang:${cmd.lang}.help.noInclude}`,
							"",
							`{lang:other.words.example$ucwords$}: \`${msg.prefix}modlog set <#channel>\``,
							`\`${msg.prefix}modlog set\` - {lang:${cmd.lang}.help.set}`,
							`\`${msg.prefix}modlog disable\` - {lang:${cmd.lang}.help.disable}`,
							`\`${msg.prefix}modlog list <@user>\` - {lang:${cmd.lang}.help.list}`/* ,
							`\`${msg.prefix}modlog clear <@user>\` - {lang:${cmd.lang}.help.clear}`*/
						].join("\n"))
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.red)
						.setFooter("OwO", this.bot.user.avatarURL)
						.toJSON()
				});
				break;
			}

			default: return "DEFAULT";
		}
	});
