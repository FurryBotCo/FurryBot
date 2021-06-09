import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import db from "../../db";
const { r: Redis } = db;
import LocalFunctions from "../../util/LocalFunctions";
import { Colors, Command, EmbedBuilder, BotFunctions } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["rank"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg) {
		if (Redis === null) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.redisNotReady"));
		const member = msg.args.length === 0 ? msg.member : await msg.getMemberFromArgs();

		if (msg.dashedArgs.value.includes("refresh")) await Redis.del(`leveling:${msg.channel.guild.id}:${msg.author.id}`);
		/* await Promise.all(Object.keys(uConfig.levels).map(async (k) => {
			if (!this.guilds.has(k)) console.log(`del ${k}`);
		}));*/

		if (!member) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});
		const c = await db.getUser(member.id);

		let u: Array<{ id: string; level: number | null; }>;
		u = await Promise.all<(typeof u)[number]>(msg.channel.guild.members.filter(m => !m.user.bot).map(async (m) => new Promise((a, b) => Redis.get(`leveling:${msg.channel.guild.id}:${m.id}`, (err, v) => !err ? a({ id: m.id, level: v === null ? null : Number(v) }) : b(err)))));
		const lvl = LocalFunctions.calcLevel(c.getLevel(msg.channel.guild.id));
		const n = LocalFunctions.calcExp(lvl.level + 1);
		const t = { id: member.id, level: lvl.total };
		if (u.indexOf(t) === -1) u.push(t);

		u = u.filter(a => a.level !== null).sort((a, b) => (b.level ?? 0) - (a.level ?? 0));
		const pos = u.indexOf(u.find(a => a.id === member.id)!);
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`${member.username}#${member.discriminator}'s Rank`)
				.setAuthor(`${member.username}#${member.discriminator}`, member.avatarURL)
				.setDescription([
					`{lang:other.words.level$ucwords$}: ${lvl.level}`,
					`{lang:other.words.xp$upper$}: ${lvl.leftover}/${n.lvl} (${lvl.total} {lang:other.words.total$ucwords$})`,
					...[!pos ? "" : `{lang:other.words.position$ucwords$}: ${pos + 1}/${u.length} ({lang:other.words.cached})`]
				].join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.toJSON()
		});
	});
