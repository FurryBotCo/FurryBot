import Eris from "eris";
import config from "../config";
import ClientEvent from "../util/ClientEvent";
import { Colors } from "../util/Constants";
import db from "../util/Database";
import EmbedBuilder from "../util/EmbedBuilder";
import Logger from "../util/Logger";

export default new ClientEvent("guildMemberUpdate", async function (guild, member, oldMember) {
	if (config.beta && !config.eventTest) return;
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.filter(l => l.type === "memberUpdate");
	for (const log of e) {
		const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !["readMessages", "sendMessages"].some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({ $pull: { logEvents: log } });
			continue;
		}

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.orange)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setTitle("{lang:other.events.memberUpdate.title}")
			.setDescription(`{lang:other.words.member$ucwords$}: **${member.user.username}#${member.user.discriminator}** <@!${member.user.id}>`);

		const content: [old: string[], new: string[]] = [
			[],
			[]
		];

		// because Discord™️
		if (member.nick === null) member.nick = "";
		if (oldMember.nick === null) oldMember.nick = "";

		// If they had a nick and they changed it from something else
		if (member.nick !== oldMember.nick) {
			content[0].push(`{lang:other.words.nickname$ucwords$}: **${oldMember.nick || "{lang:other.words.none$upper$}"}**`);
			content[1].push(`{lang:other.words.nickname$ucwords$}: **${member.nick || "{lang:other.words.none$upper$}"}**`);
		}

		// shut up
		const oldRoles: string[] = [];
		const newRoles: string[] = [];

		member.roles.map(role => oldMember.roles.includes(role) ? null : newRoles.push(role));
		oldMember.roles.map(role => member.roles.includes(role) ? null : oldRoles.push(role));

		// now we do shit here
		if (oldRoles.length) content[0].push(`{lang:other.words.roles$ucwords$}: ${oldRoles.map(id => `<@&${id}>`).join(", ") || "{lang:other.words.none$upper$}"}`);
		if (newRoles.length) content[1].push(`{lang:other.words.roles$ucwords$}: ${newRoles.map(id => `<@&${id}>`).join(", ") || "{lang:other.words.none$upper$}"}`);

		// assume no changes happened
		if (!content[0].length && !content[1].length) {
			Logger.warn(`GuildMemberUpdate[${guild.id}]`, "Got update event, but no changes were found. Skipping logging.");
			return;
		}

		if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			const { entries: a } = await guild.getAuditLogs(10, null, Eris.Constants.AuditLogActions.MEMBER_UPDATE);
			for (const log of a) {
				if (log.targetID === member.id) {
					e.setDescription([
						e.getDescription(),
						"",
						"({lang:other.words.normal})",
						`{lang:other.words.blame$ucwords$}: **${log.user.username}#${log.user.discriminator}** <@!${log.user.id}>`,
						`{lang:other.words.reason$ucwords$}: **${log.reason || "{lang:other.words.none$upper$}"}**`
					].join("\n"));
					break;
				}
			}

			const { entries: b } = await guild.getAuditLogs(10, null, Eris.Constants.AuditLogActions.MEMBER_ROLE_UPDATE);
			for (const log of b) {
				if (log.targetID === member.id) {
					e.setDescription([
						e.getDescription(),
						"",
						"({lang:other.words.roles})",
						`{lang:other.words.blame$ucwords$}: **${log.user.username}#${log.user.discriminator}** <@!${log.user.id}>`,
						`{lang:other.words.reason$ucwords$}: **${log.reason || "{lang:other.words.none$upper$}"}**`
					].join("\n"));
					break;
				}
			}
		}

		await ch.createMessage({
			embed: e
				.addField(
					"{lang:other.words.oldProps$ucwords$}",
					content[0].join("\n") || "{lang:other.words.none$upper$}",
					false
				)
				.addField(
					"{lang:other.words.newProps$ucwords$}",
					content[1].join("\n") || "{lang:other.words.none$upper$}",
					false
				)
				.toJSON()
		});
	}
});
