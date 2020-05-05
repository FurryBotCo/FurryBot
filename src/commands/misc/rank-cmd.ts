import Command from "../../util/CommandHandler/lib/Command";
import config from "../../config";
import Eris from "eris";
import { Colors } from "../../util/Constants";
import db from "../../modules/Database";
import rClient from "../../util/Redis";

export default new Command({
	triggers: [
		"rank"
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
	let user: Eris.Member;
	if (msg.args.length < 1) user = msg.member;
	else user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");
	const c = await db.getUser(user.id);

	let u: { id: string; level: number; }[] = await Promise.all(msg.channel.guild.members.filter(m => !m.user.bot).map(async (m) => new Promise((a, b) => rClient.GET(`${config.beta ? "beta" : "prod"}:leveling:${msg.channel.guild.id}:${m.id}`, (err, v) => !err ? a({ id: m.id, level: v === null ? null : Number(v) }) : b(err))))) as any;
	const f = u.filter(a => a.level === null).length;
	u = u.filter(a => a.level !== null).sort((a, b) => b.level - a.level);

	const lvl = config.leveling.calcLevel(c.getLevel(msg.channel.guild.id));
	const n = config.leveling.calcExp(lvl.level + 1);
	const pos = u.indexOf(u.find(a => a.id === msg.author.id));
	return msg.channel.createMessage({
		embed: {
			title: `${user.username}#${user.discriminator}'s Rank`,
			author: {
				name: `${user.username}#${user.discriminator}`,
				icon_url: user.avatarURL
			},
			description: [
				`Level: ${lvl.level}`,
				`XP: ${lvl.leftover}/${n.lvl} (${lvl.total} total)`,
				...[[undefined, null].includes(pos) ? "" : `Position: ${pos + 1}/${u.length} (cached)`]
			].join("\n"),
			timestamp: new Date().toISOString(),
			color: Colors.gold
		}
	});
}));
