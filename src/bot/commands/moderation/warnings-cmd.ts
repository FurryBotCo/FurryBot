import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Utility from "../../../util/Functions/Utility";
import { Colors } from "../../../util/Constants";
import CommandError from "../../../util/cmd/CommandError";
import { mdb } from "../../../util/Database";
import chunk from "chunk";
import Eris from "eris";

export default new Command(["warnings"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 2) throw new CommandError("ERR_INVALID_USAGE", cmd);

		const member = await msg.getMemberFromArgs(1);
		if (!member) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		const w = await mdb.collection<Warning>("warnings").find({
			guildId: msg.channel.guild.id,
			userId: member.id
		}).toArray();

		switch (msg.args[0]?.toLowerCase()) {
			case "list": {
				if (w.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.noWarnings`, [`${member.username}#${member.discriminator}`]));
				const pages = chunk(w, 5);
				const page = Number(msg.args[2] || 1);
				if (isNaN(page) || page > pages.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.invalidPage`, [msg.args[2], pages.length]));

				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle(`{lang:${cmd.lang}.list.title|${member.username}#${member.discriminator}}`)
						.setFooter(`Page ${page}/${pages.length}`, this.bot.user.avatarURL)
						.setTimestamp(new Date().toISOString())
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setColor(Colors.gold)
						.setDescription(`{lang:${cmd.lang}.list.dateFormat}: MM/DD/YYYY`)
						.addFields(...await Promise.all(pages[page - 1].map(async (w) => {
							const d = new Date(w.date);
							const u: Eris.User = this.bot.users.get(w.blameId) || await this.bot.getRESTUser(w.blameId).catch(err => null);
							return {
								name: `{lang:${cmd.lang}.list.num|${w.id}}`,
								value: [
									`{lang:other.words.blame$ucwords$}: ${!u ? `{lang:other.words.unknown$ucwords$}[${w.blameId}]` : `${u.username}#${u.discriminator}`}`,
									`{lang:other.words.reason$ucwords$}: ${w.reason.length > 200 ? `{lang:${cmd.lang}.list.reasonTooLong}` : w.reason}`,
									// I hate how long this line is
									`{lang:other.words.date$ucwords$}: ${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`
								].join("\n"),
								inline: false
							};
						})))
						.toJSON()
				});
				break;
			}

			case "remove": {
				if (!msg.member.permissions.has("manageMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingPerm`, ["manageMessages"]));
				if (msg.args.length < 3) return new CommandError("ERR_INVALID_USAGE", cmd);
				if (w.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.noWarnings`, [`${member.username}#${member.discriminator}`]));
				const n = Number(msg.args[2] || 1);
				if (isNaN(n) || n > w.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.invalidId`, [msg.args[2], w.length]));
				const j = w.find(k => k.id === n);
				const reason = msg.args.slice(3)?.join("") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
				await mdb.collection<Warning>("warnings").findOneAndDelete({
					guildId: msg.channel.guild.id,
					userId: member.id,
					id: j.id
				});
				await this.m.createDeleteWarningEntry(msg.channel, msg.gConfig, msg.author, member, j.blameId, j.id, reason);
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.done`, [j.id, `${member.username}#${member.discriminator}`]));
				break;
			}

			case "clear": {
				if (!msg.member.permissions.has("manageGuild")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingPerm`, ["manageServer"]));
				if (msg.args.length < 2) return new CommandError("ERR_INVALID_USAGE", cmd);
				if (w.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.noWarnings`, [`${member.username}#${member.discriminator}`]));
				for (const v of w) await mdb.collection<Warning>("warnings").findOneAndDelete({
					guildId: msg.channel.guild.id,
					userId: member.id,
					id: v.id
				});
				const reason = msg.args.slice(3)?.join("") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
				await this.m.createClearWarningsEntry(msg.channel, msg.gConfig, msg.author, member, w.length, reason);
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.done`, [w.length, `${member.username}#${member.discriminator}`]));
				break;
			}

			default: throw new CommandError("ERR_INVALID_USAGE", cmd);
		}

	})
	.setOverride("invalidUsage", async function (msg, cmd) {
		if (msg.args.length === 0 || !["list", "remove", "clear"].includes(msg.args[0]?.toLowerCase())) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.help.title}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("\u200b", this.bot.user.avatarURL)
				.setColor(Colors.red)
				.setDescription([
					`{lang:${cmd.lang}.help.subNotice}`,
					`\\* - {lang:${cmd.lang}.help.requiresPerm1|manageMessages}`,
					`\\+ - {lang:${cmd.lang}.help.requiresPerm1|manageServer}`,
					"",
					`{lang:${cmd.lang}.help.example|${msg.gConfig.settings.prefix}}`,
					"",
					`\`list\` - {lang:${cmd.lang}.help.listDesc}`,
					`(\\*) \`remove\` - {lang:${cmd.lang}.help.removeDesc}`,
					`(\\+) \`clear\` - {lang:${cmd.lang}.help.clearDesc}`
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});

		switch (msg.args[0]?.toLowerCase()) {
			case "list": return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.help.title} - {lang:other.words.list$ucwords$}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter("\u200b", this.bot.user.avatarURL)
					.setColor(Colors.red)
					.setDescription([
						`{lang:${cmd.lang}.help.noPerms}`,
						"",
						`{lang:other.words.usage$ucwords$}: \`${msg.gConfig.settings.prefix}warnings list @user [page]\``
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.toJSON()
			});

			case "remove": return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.help.title} - {lang:other.words.remove$ucwords$}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter("\u200b", this.bot.user.avatarURL)
					.setColor(Colors.red)
					.setDescription([
						`{lang:${cmd.lang}.help.requiresPerm2|manageMessages}`,
						"",
						`{lang:other.words.usage$ucwords$}: \`${msg.gConfig.settings.prefix}warnings remove @user <id>\``
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.toJSON()
			});

			case "clear": return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.help.title} - {lang:other.words.clear$ucwords$}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter("\u200b", this.bot.user.avatarURL)
					.setColor(Colors.red)
					.setDescription([
						`{lang:${cmd.lang}.help.requiresPerm2|manageServer}`,
						"",
						`{lang:other.words.usage$ucwords$}: \`${msg.gConfig.settings.prefix}warnings clear @user\``
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.toJSON()
			});

			default: throw new TypeError("We shouldn't be here. Please report this. (w/d)");
		}
	});
