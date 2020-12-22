import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import chunk from "chunk";
import Redis from "../../util/Redis";
import Language from "../../util/Language";
import config from "../../config";
import db from "../../util/Database";
import Utility from "../../util/Functions/Utility";

export default new Command(["rank"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const member = msg.args.length === 0 ? msg.member : await msg.getMemberFromArgs();

		if (msg.dashedArgs.value.includes("refresh")) await Redis.del(`leveling:${msg.channel.guild.id}:${msg.author.id}`);
		/* await Promise.all(Object.keys(uConfig.levels).map(async (k) => {
			if (!this.guilds.has(k)) console.log(`del ${k}`);
		}));*/

		if (!member) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});
		const c = await db.getUser(member.id);

		let u: { id: string; level: number; }[] = await Promise.all(msg.channel.guild.members.filter(m => !m.user.bot).map(async (m) => new Promise((a, b) => Redis.get(`leveling:${msg.channel.guild.id}:${m.id}`, (err, v) => !err ? a({ id: m.id, level: v === null ? null : Number(v) }) : b(err))))) as any;
		const lvl = Utility.calcLevel(c.getLevel(msg.channel.guild.id));
		const n = Utility.calcExp(lvl.level + 1);
		const t = { id: member.id, level: lvl.total };
		if (u.indexOf(t) === -1) u.push(t);

		u = u.filter(a => a.level !== null).sort((a, b) => b.level - a.level);
		const pos = u.indexOf(u.find(a => a.id === member.id));
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`${member.username}#${member.discriminator}'s Rank`)
				.setAuthor(`${member.username}#${member.discriminator}`, member.avatarURL)
				.setDescription([
					`{lang:other.words.level$ucwords$}: ${lvl.level}`,
					`{lang:other.words.xp$upper$}: ${lvl.leftover}/${n.lvl} (${lvl.total} {lang:other.words.total$ucwords$})`,
					...[[undefined, null].includes(pos) ? "" : `{lang:other.words.position$ucwords$}: ${pos + 1}/${u.length} ({lang:other.words.cached})`]
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.toJSON()
		});
	});
