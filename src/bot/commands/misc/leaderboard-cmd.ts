import Command from "../../../util/cmd/Command";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import chunk from "chunk";
import Redis from "../../../util/Redis";
import Language from "../../../util/Language";
import config from "../../../config";

export default new Command(["leaderboard", "lb"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const members = msg.channel.guild.members.filter(m => !m.user.bot);
		// if (members.length > 1000) return msg.reply("{lang:${cmd.lang}.serverTooLarge}");

		let u: { id: string; level: number; }[] = await Promise.all(members.map(async (m) => new Promise((a, b) => Redis.get(`leveling:${msg.channel.guild.id}:${m.id}`, (err, v) => !err ? a({ id: m.id, level: v === null ? null : Number(v) }) : b(err))))) as any;
		const f = u.filter(a => a.level === null).length;
		u = u.filter(a => a.level !== null).sort((a, b) => b.level - a.level);
		const c = chunk(u, 10);

		const page = msg.args.length > 0 ? Number(msg.args[0]) : 1;
		if (c.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noPages`));
		if (isNaN(page)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidPage`, [c.length]));
		if (page < 1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.pageLessThan`, [c.length]));
		if (page > c.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.pageMoreThan`, [c.length]));


		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.embed.title}`)
				.setDescription([
					...c[page - 1].map((k, i) => {
						const l = config.leveling.calcLevel(k.level);
						return `**#${(i + 1) + ((page - 1) * 10)}**: <@!${k.id}> - **Level ${l.level}** (${l.leftover}/${l.leftover + l.needed} {lang:${cmd.lang}.embed.until})`;
					})
				].join("\n"))
				.setFooter(`{lang:${cmd.lang}.embed.footer|${page}|${c.length}|${f}}`)
				.setColor(Colors.gold)
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});
	});
