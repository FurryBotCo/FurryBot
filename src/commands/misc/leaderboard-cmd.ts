import Command from "../../util/CommandHandler/lib/Command";
import config from "../../config";
import Eris from "eris";
import { Colors } from "../../util/Constants";
import db from "../../modules/Database";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Utility } from "../../util/Functions";
import chunk from "chunk";
import rClient from "../../util/Redis";

export default new Command({
	triggers: [
		"leaderboard",
		"lb"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const members = msg.channel.guild.members.filter(m => !m.user.bot);
	// if (members.length > 1000) return msg.reply("{lang:commands.misc.leaderboard.serverTooLarge}");

	let u: { id: string; level: number; }[] = await Promise.all(members.map(async (m) => new Promise((a, b) => rClient.GET(`${config.beta ? "beta" : "prod"}:leveling:${msg.channel.guild.id}:${m.id}`, (err, v) => !err ? a({ id: m.id, level: v === null ? null : Number(v) }) : b(err))))) as any;
	const f = u.filter(a => a.level === null).length;
	u = u.filter(a => a.level !== null).sort((a, b) => b.level - a.level);
	const c = chunk(u, 10);

	const page = msg.args.length > 0 ? Number(msg.args[0]) : 1;
	if (isNaN(page)) return msg.reply(`{lang:commands.misc.leaderboard.invalidPage|${c.length}}`);
	if (page < 1) return msg.reply(`{lang:commands.misc.leaderboard.pageLessThan|${c.length}}`);
	if (page > c.length) return msg.reply(`{lang:commands.misc.leaderboard.pageMoreThan|${c.length}}`);


	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.misc.leaderboard.embed.title}")
			.setDescription([
				...c[page - 1].map((k, i) => {
					const l = config.leveling.calcLevel(k.level);
					return `**#${i + 1}**: <@!${k.id}> - **Level ${l.level}** (${l.leftover}/${l.leftover + l.needed} {lang:commands.misc.leaderboard.embed.until})`;
				})
			].join("\n"))
			.setFooter(`{lang:commands.misc.leaderboard.embed.footer|${page}|${c.length}|${f}}`)
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString())
	});
}));
