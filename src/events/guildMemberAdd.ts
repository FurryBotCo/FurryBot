import Eris from "eris";
import config from "../config";
import ClientEvent from "../util/ClientEvent";
import { Colors } from "../util/Constants";
import db from "../util/Database";
import EmbedBuilder from "../util/EmbedBuilder";
import Time from "../util/Functions/Time";

export default new ClientEvent("guildMemberAdd", async function (guild, member) {
	/* this.counters.push({
		type: "guildMemberAdd",
		time: Date.now()
	}); */
	if (config.beta && !config.eventTest) return;
	const g = await db.getGuild(guild.id).then(v => v.fix());
	const e = g.logEvents.filter(l => l.type === "memberJoin");
	for (const log of e) {
		const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !["readMessages", "sendMessages"].some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({ $pull: { logEvents: log } });
			continue;
		}

		const u = await db.getUser(member.id);
		const badges = await u.getBadges(this);
		const cat: {
			[k in typeof badges[number]["category"]]: (typeof badges[number])[];
		} = {};
		badges.map(b => {
			if (!cat[b.category]) cat[b.category] = [];
			cat[b.category].push(b);
		});

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setTitle("{lang:other.events.memberJoin.title}")
			.setThumbnail(member.user.avatarURL)
			.setDescription([
				`{lang:other.words.member$ucwords$}: **${member.user.username}#${member.user.discriminator}** <@!${member.user.id}>`,
				`{lang:other.words.creationDate$ucwords$}: **${Time.formatDateWithPadding(member.user.createdAt, true, false, true, true)}**`,
				"",
				"**{lang:other.words.user$ucwords$} {lang:other.words.badges$ucwords$}:**",
				...Object.keys(cat).map(k => {
					return [
						`- {lang:other.badges.category.${k}}`,
						...(cat[k].map(v => `${v.emoji} **{lang:other.badges.names.${v.id}}**`) || [`${config.emojis.default.dot} {lang:other.words.none}`])
					].join("\n");
				})
			].join("\n"))
			.setFooter(`{lang:other.events.memberJoin.footer|${guild.memberCount}|${Time.formatAgo(member.user.createdAt, true, true).split(",")[0]}$ucwords$}`);

		await ch.createMessage({ embed: e.toJSON() });
	}
});
