import Command from "../../../util/cmd/Command";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import chunk from "chunk";
import Redis from "../../../util/Redis";
import Language from "../../../util/Language";
import config from "../../../config";
import Utility from "../../../util/Functions/Utility";
import { performance } from "perf_hooks";

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
			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.embed.titleGlobal}`)
					.setDescription([
						`{lang:${cmd.lang}.embed.hover}`,
						...c[page - 1].map((k, i) => {
							const l = config.leveling.calcLevel(k.amount);
							return `[**#${(i + 1) + ((page - 1) * 10)}**](http://furry.bot '{lang:${cmd.lang}.embed.in|${this.bot.guilds.get(k.guild)?.name || Language.get(msg.gConfig.settings.lang, "other.words.unknown")}}'): <@!${k.user}> - **Level ${l.level}** (${l.leftover}/${l.leftover + l.needed} {lang:${cmd.lang}.embed.until})`;
						})
					].join("\n"))
					.setFooter(`{lang:${cmd.lang}.embed.footer|${page}|${c.length}|${this.bot.users.size - entries.length}|${time}}`)
					.setColor(Colors.gold)
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
					.setFooter(`{lang:${cmd.lang}.embed.footer|${page}|${c.length}|${f}|${(end - start).toFixed(3)}}`)
					.setColor(Colors.gold)
					.setTimestamp(new Date().toISOString())
					.toJSON()
			});
		}
	});
