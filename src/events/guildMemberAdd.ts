import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, defaultEmojis, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";
import { Time } from "utilities";

export default new ClientEvent<FurryBot>("guildMemberAdd", async function (guild, member) {
	if (config.beta && !config.eventTest) return;
	const g = await db.getGuild(guild.id).then(v => v.fix());
	const events = g.logEvents.filter(l => l.type === "memberJoin");
	for (const event of events) {
		const ch = guild.channels.get(event.channel) as Eris.GuildTextableChannel;
		if (!ch || !(["viewChannel", "sendMessages"] as Array<ErisPermissions>).some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({
				$pull: {
					logEvents: event
				}
			});
			continue;
		}

		const u = await db.getUser(member.id);
		const badges = await u.getBadges(this);
		const cat: {
			[k in typeof badges[number]["category"]]: Array<typeof badges[number]>;
		} = {};
		badges.map(b => {
			if (!cat[b.category]) cat[b.category] = [];
			cat[b.category].push(b);
		});

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL ?? config.images.noIcon)
			.setTitle("{lang:other.events.memberJoin.title}")
			.setThumbnail(member.user.avatarURL)
			.setDescription([
				`{lang:other.words.member$ucwords$}: **${member.user.username}#${member.user.discriminator}** <@!${member.user.id}>`,
				`{lang:other.words.creationDate$ucwords$}: **${Time.formatDateWithPadding(member.user.createdAt, true, false, true, true)}**`,
				"",
				"**{lang:other.words.user$ucwords$} {lang:other.words.badges$ucwords$}:**",
				...Object.keys(cat).map(k => [
					`- {lang:other.badges.category.${k}}`,
					...(cat[k].map(v => `${v.emoji} **{lang:other.badges.names.${v.id}}**`) || [`${defaultEmojis.dot} {lang:other.words.none}`])
				].join("\n"))
			].join("\n"))
			.setFooter(`{lang:other.events.memberJoin.footer|${guild.memberCount}|${Time.formatAgo(member.user.createdAt, true, true).split(",")[0]}$ucwords$}`);

		await ch.createMessage({ embed: e.toJSON() });
	}
});
