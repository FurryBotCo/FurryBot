import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import chunk from "chunk";
import Redis from "../../util/Redis";
import Language from "../../util/Language";
import config from "../../config";
import Utility from "../../util/Functions/Utility";
import { performance } from "perf_hooks";
import Eris from "eris";
import Internal from "../../util/Functions/Internal";

export default new Command(["leaderboard", "lb"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(1.5e4, true)
	.setExecutor(async function (msg, cmd) {
		const global = msg.dashedArgs.value.includes("global");

		const page = msg.args.length > 0 ? Number(msg.args[0]) : 1;

		if (global) {
			const { entries, time } = await Utility.getHighestLevels(false);
			const c = chunk(entries, 10);
			if (c.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noPages`));
			if (isNaN(page)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidPage`, [c.length]));
			if (page < 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.pageLessThan`, [c.length]));
			if (page > c.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.pageMoreThan`, [c.length]));
			const content: string[] = [];
			let b = 0;

			// I would do a for-of but I need the position
			for (let i = 0; i < c[page - 1].length; i++) {
				const k = c[page - 1][i];
				const l = config.leveling.calcLevel(k.amount);
				const g: Eris.Guild = this.bot.guilds.get(k.guild);
				const u: Eris.User = this.bot.users.get(k.user) || await this.getUser(k.user).catch(err => null);
				if (!u || !g) continue;
				if (!this.bot.users.has(u.id)) this.bot.users.set(u.id, u);
				const pText = Internal.genTooltip(msg.gConfig.settings.lang, `**#${(i + 1) + ((page - 1) * 10)}**`, `{lang:${cmd.lang}.embed.guild|${g?.name || Language.get(msg.gConfig.settings.lang, "other.words.unknown")}|${k.guild}|${g?.memberCount || Language.get(msg.gConfig.settings.lang, "other.words.unknown")}}`);
				const uText = Internal.genTooltip(msg.gConfig.settings.lang, `${u.username}#${u.discriminator}`, `{lang:${cmd.lang}.embed.user|${u.id}}`);
				const text = `${pText}: ${uText} - **Level ${l.level}** (${l.leftover}/${l.leftover + l.needed} {lang:${cmd.lang}.embed.until})`;
				if (!content[b]) {
					content[b] = text;
					continue;
				}

				if ((content[b].length + text.length) > 1024) {
					b++;
					content[b] = text;
				} else {
					content[b] = `${content[b]}\n${text}`;
				}
			}

			const e = this.bot.users.size - entries.length;
			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.embed.titleGlobal}`)
					.setDescription([
						`{lang:${cmd.lang}.embed.hover}`
					].join("\n"))
					.setFooter(`{lang:${cmd.lang}.embed.footer|${page}|${c.length}|${e < 0 ? 0 : e}|${time}}`)
					.setColor(Colors.gold)
					.addFields(...content.map((v, i) => ({
						name: `{lang:${cmd.lang}.embed.listNum|${i + 1}}`,
						value: v,
						inline: false
					})))
					.setTimestamp(new Date().toISOString())
					.toJSON()
			});
		} else {
			const start = performance.now();
			const members = msg.channel.guild.members.filter(m => !m.user.bot);
			const keys = members.map(m => `leveling:${msg.channel.guild.id}:${m.id}`);
			const values = await Redis.mget(keys);
			const u = keys.map((k, i) => ({
				id: k.split(":")[2],
				amount: values[i] === null ? null : Number(values[i])
			})).sort((a, b) => b.amount - a.amount);
			let f = 0;
			for (const k of u) {
				if (k.amount === null || isNaN(k.amount)) {
					f++;
					u.splice(u.indexOf(k), 1);
				} else continue;
			}
			const c = chunk(u, 10);

			if (c.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noPages`));
			if (isNaN(page)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidPage`, [c.length]));
			if (page < 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.pageLessThan`, [c.length]));
			if (page > c.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.pageMoreThan`, [c.length]));
			const end = performance.now();

			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.embed.title${global ? "Global" : ""}}`)
					.setDescription([
						`{lang:${cmd.lang}.embed.global}`,
						...c[page - 1].map((k, i) => {
							const l = config.leveling.calcLevel(k.amount);
							return `**#${(i + 1) + ((page - 1) * 10)}**: <@!${k.id}> - **Level ${l.level}** (${l.leftover}/${l.leftover + l.needed} {lang:${cmd.lang}.embed.until})`;
						})
					].join("\n"))
					.setFooter(`{lang:${cmd.lang}.embed.footer|${page}|${c.length}|${f < 0 ? 0 : f}|${(end - start).toFixed(3)}}`)
					.setColor(Colors.gold)
					.setTimestamp(new Date().toISOString())
					.toJSON()
			});
		}
	});