import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import db from "../../../src/db";
import { Warning } from "../../util/@types/Database";
import config from "../../../src/config";
import { BotFunctions, Colors, Command, CommandError, EmbedBuilder } from "core";
import Language from "language";
import { WithId } from "mongodb";
import chunk from "chunk";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["warnings"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 2) throw new CommandError("INVALID_USAGE", cmd);

		const member = await msg.getMemberFromArgs(1, true, 0);
		if (!member) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		const w = await db.collection<WithId<Warning>>("warnings").find({
			guildId: msg.channel.guild.id,
			userId: member.id
		}).toArray().then(v => v.sort((a, b) => a.id - b.id));

		switch (msg.args[0]?.toLowerCase()) {
			case "list": {
				const dev = msg.dashedArgs.value.includes("dev");
				if (dev && !config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.devOnlyFlag`));
				if (w.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.noWarnings`, [`${member.username}#${member.discriminator}`]));
				const pages = chunk(w, 5);
				const page = Number(msg.args[2] || 1);
				if (isNaN(page) || page > pages.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.invalidPage`, [msg.args[2], pages.length]));

				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle(`{lang:${cmd.lang}.list.title|${member.username}#${member.discriminator}}`)
						.setFooter(`Page ${page}/${pages.length}`, this.client.user.avatarURL)
						.setTimestamp(new Date().toISOString())
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setColor(Colors.gold)
						.setDescription(`{lang:${cmd.lang}.list.dateFormat}: MM/DD/YYYY`)
						.addFields(...await Promise.all(pages[page - 1].map(async (v) => {
							const d = new Date(v.date);
							const u: Eris.User | null = this.client.users.get(v.blameId) || await this.client.getRESTUser(v.blameId).catch(() => null);
							return {
								name: `{lang:${cmd.lang}.list.num|${v.id}}`,
								value: [
									`{lang:other.words.blame$ucwords$}: ${!u ? `{lang:other.words.unknown$ucwords$}[${v.blameId}]` : `${u.username}#${u.discriminator}`}`,
									`{lang:other.words.reason$ucwords$}: ${v.reason.length > 200 ? `{lang:${cmd.lang}.list.reasonTooLong}` : v.reason}`,
									// I hate how long this line is
									`{lang:other.words.date$ucwords$}: ${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`,
									...(dev ? [
										`Internal ID: \`${String(v._id)}\``
									] : [])
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
				if (msg.args.length < 3) return new CommandError("INVALID_USAGE", cmd);
				if (w.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.noWarnings`, [`${member.username}#${member.discriminator}`]));
				const n = Number(msg.args[2] || 1);
				if (isNaN(n) || n > w.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.invalidId`, [msg.args[2], w.length]));
				const j = w.find(k => k.id === n)!;
				const reason = msg.args.slice(3)?.join("") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
				await db.collection<Warning>("warnings").findOneAndDelete({
					guildId: msg.channel.guild.id,
					userId: member.id,
					id: j.id
				});
				await this.executeModCommand("deleteWarning", {
					reason,
					id: j.id,
					channel: msg.channel.id,
					oldBlame: j.blameId,
					target: member.id,
					blame: msg.author.id
				});
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.done`, [j.id, `${member.username}#${member.discriminator}`]));
				break;
			}

			case "clear": {
				if (!msg.member.permissions.has("manageGuild")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingPerm`, ["manageServer"]));
				if (msg.args.length < 2) return new CommandError("INVALID_USAGE", cmd);
				if (w.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.noWarnings`, [`${member.username}#${member.discriminator}`]));
				for (const v of w) await db.collection<Warning>("warnings").findOneAndDelete({
					guildId: msg.channel.guild.id,
					userId: member.id,
					id: v.id
				});
				const reason = msg.args.slice(3)?.join("") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
				await this.executeModCommand("clearWarnings", {
					reason,
					channel: msg.channel.id,
					target: member.id,
					blame: msg.author.id,
					total: w.length
				});
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.done`, [w.length, `${member.username}#${member.discriminator}`]));
				break;
			}

			default: throw new CommandError("INVALID_USAGE", cmd);
		}

	})
	.setOverride("invalidUsage", async function (msg, cmd) {
		if (msg.args.length === 0 || !["list", "remove", "clear"].includes(msg.args[0]?.toLowerCase())) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.help.title}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("OwO", this.client.user.avatarURL)
				.setColor(Colors.red)
				.setDescription([
					`{lang:${cmd.lang}.help.subNotice}`,
					`\\* - {lang:${cmd.lang}.help.requiresPerm1|manageMessages}`,
					`\\+ - {lang:${cmd.lang}.help.requiresPerm1|manageServer}`,
					"",
					`{lang:${cmd.lang}.help.example|${msg.prefix}}`,
					"",
					`\`list\` - {lang:${cmd.lang}.help.listDesc}`,
					`(\\*) \`remove\` - {lang:${cmd.lang}.help.removeDesc}`,
					`(\\+) \`clear\` - {lang:${cmd.lang}.help.clearDesc}`
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.toJSON()
		}).then(() => undefined);

		switch (msg.args[0]?.toLowerCase()) {
			case "list": return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.help.title} - {lang:other.words.list$ucwords$}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter("OwO", this.client.user.avatarURL)
					.setColor(Colors.red)
					.setDescription([
						`{lang:${cmd.lang}.help.noPerms}`,
						"",
						`{lang:other.words.usage$ucwords$}: \`${msg.prefix}warnings list @user [page]\``
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.toJSON()
			}).then(() => undefined);

			case "remove": return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.help.title} - {lang:other.words.remove$ucwords$}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter("OwO", this.client.user.avatarURL)
					.setColor(Colors.red)
					.setDescription([
						`{lang:${cmd.lang}.help.requiresPerm2|manageMessages}`,
						"",
						`{lang:other.words.usage$ucwords$}: \`${msg.prefix}warnings remove @user <id>\``
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.toJSON()
			}).then(() => undefined);

			case "clear": return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.help.title} - {lang:other.words.clear$ucwords$}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter("OwO", this.client.user.avatarURL)
					.setColor(Colors.red)
					.setDescription([
						`{lang:${cmd.lang}.help.requiresPerm2|manageServer}`,
						"",
						`{lang:other.words.usage$ucwords$}: \`${msg.prefix}warnings clear @user\``
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.toJSON()
			}).then(() => undefined);

			default: throw new TypeError("We shouldn't be here. Please report this. (w/d)");
		}
	});
