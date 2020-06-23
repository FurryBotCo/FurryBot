import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import Eris from "eris";
import config from "../../config";
import { Colors } from "../../util/Constants";
import db from "../../modules/Database";
import { Redis } from "../../modules/External";

export default new Command({
	triggers: [
		"rank"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	let user: Eris.Member;
	if (msg.args.length < 1) user = msg.member;
	else user = await msg.getMemberFromArgs();

	/*await Promise.all(Object.keys(uConfig.levels).map(async (k) => {
		if (!this.guilds.has(k)) console.log(`del ${k}`);
	}));*/

	if (!user) return msg.errorEmbed("INVALID_USER");
	const c = await db.getUser(user.id);

	let u: { id: string; level: number; }[] = await Promise.all(msg.channel.guild.members.filter(m => !m.user.bot).map(async (m) => new Promise((a, b) => Redis.GET(`${config.beta ? "beta" : "prod"}:leveling:${msg.channel.guild.id}:${m.id}`, (err, v) => !err ? a({ id: m.id, level: v === null ? null : Number(v) }) : b(err))))) as any;
	const f = u.filter(a => a.level === null).length;
	const lvl = config.leveling.calcLevel(c.getLevel(msg.channel.guild.id));
	const n = config.leveling.calcExp(lvl.level + 1);
	const t = { id: user.id, level: lvl.total };
	if (u.indexOf(t) === -1) u.push(t);

	u = u.filter(a => a.level !== null).sort((a, b) => b.level - a.level);
	const pos = u.indexOf(u.find(a => a.id === user.id));
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle(`${user.username}#${user.discriminator}'s Rank`)
			.setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL)
			.setDescription([
				`{lang:other.words.level}: ${lvl.level}`,
				`{lang:other.words.xp}: ${lvl.leftover}/${n.lvl} (${lvl.total} {lang:other.words.total})`,
				...[[undefined, null].includes(pos) ? "" : `{lang:other.words.position}: ${pos + 1}/${u.length} ({lang:other.words.cached})`]
			].join("\n"))
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.toJSON()
	});
}));
