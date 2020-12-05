import Eris from "eris";
import config from "../config";
import ClientEvent from "../util/ClientEvent";
import { Colors } from "../util/Constants";
import db from "../util/Database";
import EmbedBuilder from "../util/EmbedBuilder";
import Time from "../util/Functions/Time";

export default new ClientEvent("guildMemberRemove", async function (guild, member) {
	/* this.counters.push({
		type: "guildMemberRemove",
		time: Date.now()
	}); */
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.filter(l => l.type === "memberLeave");
	for (const log of e) {
		const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !["readMessages", "sendMessages"].some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({ $pull: { logEvents: log } });
			continue;
		}

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setThumbnail(member.user.avatarURL)
			.setTitle("{lang:other.events.memberLeft.title}")
			.setDescription([
				`{lang:other.words.member$ucwords$}: **${member.user.username}#${member.user.discriminator}** <@!${member.user.id}>`,
				`{lang:other.words.creationDate$ucwords$}: **${Time.formatDateWithPadding(member.user.createdAt, true, false, true, true)}**`
			].join("\n"));

		if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			const { entries: a } = await guild.getAuditLogs(10, null, Eris.Constants.AuditLogActions.MEMBER_KICK);
			for (const log of a) {
				if (log.targetID === member.id) {
					const e = g.logEvents.filter(event => event.type === "memberLeave");
					inner: for (const l of e) {
						const ch = guild.channels.get(l.channel) as Eris.GuildTextableChannel;
						if (!ch || !["readMessages", "sendMessages"].some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
							await g.mongoEdit({ $pull: { logEvents: l } });
							continue inner;
						}

						const e = new EmbedBuilder(g.settings.lang)
							.setColor(Colors.gold)
							.setTimestamp(new Date().toISOString())
							.setAuthor(guild.name, guild.iconURL)
							.setThumbnail(member.user.avatarURL)
							.setTitle("{lang:other.events.memberLeft.titleKicked}")
							.setDescription([
								`{lang:other.words.user$ucwords$}: **${member.user.username}#${member.user.discriminator}** (${member.user.id})`,
								`{lang:other.words.creationDate$ucwords$}: **${Time.formatDateWithPadding(member.user.createdAt, true, false, true, true)}**`,
								"",
								`{lang:other.words.blame$ucwords$}: **${log.user.username}#${log.user.discriminator}** <@!${log.user.id}>`,
								`{lang:other.words.reason$ucwords$}: **${log.reason || "{lang:other.words.none$upper$}"}**`
							].join("\n"));

						ch.createMessage({
							embed: e.toJSON()
						});
						break;
					}
				}
			}
		}

		await ch.createMessage({ embed: e.toJSON() });
	}
});
