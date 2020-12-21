import Eris from "eris";
import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";
import chunk from "chunk";
import crypto from "crypto";

// @TODO webhooks
export default new Command(["auto"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([
		"manageGuild"
	])
	.setRestrictions([
		"donator"
	])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if ([null, undefined].includes(msg.gConfig.auto)) await msg.gConfig.mongoEdit({
			$set: {
				auto: []
			}
		});
		const types = [
			"birb", "bunny", "cat", "duck",
			"fox", "koala", "otter", "panda",
			"snek", "turtle", "wah", "wolf",
			"fursuit", "butts", "bulge",
			"yiff.gay", "yiff.straight", "yiff.lesbian", "yiff.gynomorph"
		] as const;
		const max = 10;
		function f(t: string) {
			// allows for stuff like yiff-gay and yiffgay
			return types.find(v => [v, v.replace(/\./g, "-"), v.replace(/\./g, "")].some(j => j.toLowerCase() === t.toLowerCase()));
		}
		switch (msg.args[0]?.toLowerCase()) {
			case "add": {
				if (msg.gConfig.auto.length >= max) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.max`, [max, msg.gConfig.settings.prefix]));
				if (msg.args.length !== 4) return new CommandError("ERR_INVALID_USAGE", cmd);
				const t = f(msg.args[1]);
				if (!t) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.invalidType`, [msg.args[1]]));
				const time = Number(msg.args[2]) as (5 | 10 | 15 | 30 | 60);
				if (isNaN(time) || !([5, 10, 15, 30, 60] as const).includes(time)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.invalidTime`, [msg.args[2]]));
				const ch = await msg.getChannelFromArgs(3, true, 0);
				if (!ch) return msg.reply({
					embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL", true)
				});
				const perms: (keyof (typeof Eris["Constants"]["Permissions"]))[] = [
					"sendMessages",
					"embedLinks"
				];
				for (const p of perms) {
					if (!ch.permissionsOf(this.bot.user.id).has(p)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.missingPermission`, [p, ch.id]));
				}
				if ((t.startsWith("yiff") || ["butts", "bulge"].includes(t)) && !ch.nsfw) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.nsfw`, [msg.args[1], ch.id]));
				const j = {
					id: crypto.randomBytes(12).toString("hex"),
					type: t,
					time,
					channel: ch.id
				} as const;

				const { value: k } = await msg.gConfig.mongoEdit({
					$push: {
						auto: j
					}
				});
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.add.done`, [t, ch.id, msg.gConfig.settings.prefix, (k.auto?.length || 0) + 1]));

				break;
			}

			case "remove": {
				if (msg.args.length !== 2) return new CommandError("ERR_INVALID_USAGE", cmd);
				if (msg.gConfig.auto.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.noEntries`));
				const id = Number(msg.args[1]);
				if (id < 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.lessThanOne`));
				if (id > msg.gConfig.auto.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.invalidId`, [id]));
				const j = [...msg.gConfig.auto];
				const v = j.splice(id - 1, 1)[0];
				await msg.gConfig.mongoEdit({
					$pull: {
						auto: v
					}
				});
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.remove.done`, [id, v.type, v.channel]));
				break;
			}

			case "list": {
				if (msg.gConfig.auto.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.noEntries`));
				const perPage = 15;
				const pages = chunk(msg.gConfig.auto, perPage);
				const page = msg.args.length === 1 ? 1 : Number(msg.args[1]);
				if (page < 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.lessThanOne`));
				if (page > pages.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.list.invalidPage${pages.length === 1 ? "One" : ""}`, [page, pages.length]));
				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setDescription(pages[page - 1].map((v, i) => `{lang:${cmd.lang}.list.entry|${(i + 1) + ((page - 1) * perPage)}|${v.type}|${v.channel}|${v.time}}`).join("\n"))
						.setTitle(`{lang:${cmd.lang}.list.page|${page}}`)
						.setFooter(`{lang:${cmd.lang}.list.footer|${page}|${pages.length}|${msg.gConfig.auto.length}|${msg.gConfig.settings.prefix}}`, this.bot.user.avatarURL)
						.setColor(Colors.gold)
						.setTimestamp(new Date().toISOString())
						.toJSON()
				});
				break;
			}

			case "available": {
				const incomplete = [
				];
				const text = types.map(v => `**${v}** - ${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.available.${v.replace(/\./g, "-")}`)}`);
				const end: string[] = [];
				let i = 0;
				for (const t of text) {
					if (!end[i]) end[i] = "";
					if (end[i].length > 1750 || (end[i].length + t.length) > 1750) {
						i++;
						end[i] = "";
						end[i - 1] = end[i - 1].slice(0, -2);
					}

					// incomplete.some(v => t.indexOf(v) !== -1)
					const j = incomplete.find(v => t.indexOf(v) !== -1);

					// I could make this a lot simpler but meh
					end[i] += `${!!j ? t.replace(new RegExp(`\\*\\*${j}\\*\\*`), `__**${j}**__`) : t}\n`;
				}
				await msg.reply(`${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.available.possible`)}\n${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.available.incomplete`)}\n\n${end[0]}`);
				if (end.length > 1) {
					for (const v of end) {
						if (v === end[0]) continue;
						await msg.channel.createMessage(v);
					}
				}
				break;
			}

			case "clear": {
				if (!msg.member.permissions.has("manageGuild")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.needPermission`));
				const len = msg.gConfig.auto.length;
				if (len === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.noEntries`));
				await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.confirm`, [len]));
				const v = await this.col.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id, 1);
				if (!v || v.content.toLowerCase() !== "yes") return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.cancelled`));
				await msg.gConfig.mongoEdit({
					$set: {
						auto: []
					}
				});
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.clear.done`, [len]));
				break;
			}

			default: return new CommandError("ERR_INVALID_USAGE", cmd, "NONE_PROVIDED");
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
							`{lang:other.words.example$ucwords$}: \`${msg.gConfig.settings.prefix}auto add wah 5 <#channel>\``,
							`{lang:${cmd.lang}.help.validTimes}`,
							`\`${msg.gConfig.settings.prefix}log add <type> <time> <#channel>\` - {lang:${cmd.lang}.help.add}`,
							`\`${msg.gConfig.settings.prefix}log remove <id>\` - {lang:${cmd.lang}.help.remove}`,
							`\`${msg.gConfig.settings.prefix}log list\` - {lang:${cmd.lang}.help.list}`,
							`\`${msg.gConfig.settings.prefix}log available\` - {lang:${cmd.lang}.help.available}`,
							`\`${msg.gConfig.settings.prefix}log clear\` - {lang:${cmd.lang}.help.clear}`
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
