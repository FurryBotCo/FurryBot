import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import db from "../../db";
const { r: Redis } = db;
import LocalFunctions from "../../util/LocalFunctions";
import { Colors, Command, EmbedBuilder } from "core";
import Language from "language";
import chunk from "chunk";
import Eris from "eris";
import { performance } from "perf_hooks";

export default new Command<FurryBot, UserConfig, GuildConfig>(["leaderboard", "lb"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(1.5e4, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (Redis === null) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.redisNotReady"));
		const global = msg.dashedArgs.value.includes("global") || ((msg.args[0] || msg.args[1] || "").toLowerCase()) === "true";

		const page = msg.args.length > 0 ? Number(msg.args[0]) : 1;

		if (global) {
			const { entries, time } = await LocalFunctions.getHighestLevels(false);
			const c = chunk(entries, 10);
			if (c.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noPages`));
			if (isNaN(page)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidPage`, [c.length]));
			if (page < 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.pageLessThan`, [c.length]));
			if (page > c.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.pageMoreThan`, [c.length]));
			const v = await Promise.all(c[page - 1].map(async ({ amount, user }, i) => {
				const l = LocalFunctions.calcLevel(amount);
				const u: Eris.User | { username: string; } = await this.getUser(user).catch(() => null) ?? { username: "Invalid-User" };
				return `**#${(i + 1) + ((page - 1) * 10)}**: \`${u.username.replace(/`/g, "")}\` - **Level ${l.level}** (${l.leftover}/${l.leftover + l.needed} {lang:${cmd.lang}.embed.until})`;
			}));

			const e = this.client.users.size - entries.length;
			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.embed.titleGlobal}`)
					.setDescription(v.join("\n"))
					.setFooter(`{lang:${cmd.lang}.embed.footer|${page}|${c.length}|${e < 0 ? 0 : e}|${time}}`)
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
			})).sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
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
							const l = LocalFunctions.calcLevel(k.amount ?? 0);
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
