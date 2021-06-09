import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";
import Logger from "logger";

// @TODO pending
export default new ClientEvent<FurryBot>("guildMemberUpdate", async function (guild, member, oldMember) {
	if (config.beta && !config.eventTest) return;
	// because Eris™️
	if (oldMember === null) return;
	const g = await db.getGuild(guild.id).then(v => v.fix());
	const events = g.logEvents.filter(l => l.type === "memberUpdate");
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

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.orange)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL ?? config.images.noIcon)
			.setTitle("{lang:other.events.memberUpdate.title}")
			.setDescription(`{lang:other.words.member$ucwords$}: **${member.user.username}#${member.user.discriminator}** <@!${member.user.id}>`);

		const content: [old: Array<string>, new: Array<string>] = [
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

		// membership screening
		if (member.pending !== oldMember.pending) {
			content[0].push(`{lang:other.words.pending$ucwords$}: **${oldMember.pending ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
			content[1].push(`{lang:other.words.pending$ucwords$}: **${member.pending ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
		}

		// shut up
		const oldRoles: Array<string> = [];
		const newRoles: Array<string> = [];

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
			const { entries: a } = await guild.getAuditLog({
				limit: 10,
				actionType: Eris.Constants.AuditLogActions.MEMBER_UPDATE
			});
			for (const entry of a) {
				if (entry.targetID === member.id) {
					e.setDescription([
						e.getDescription(),
						"",
						"({lang:other.words.normal})",
						`{lang:other.words.blame$ucwords$}: **${entry.user.username}#${entry.user.discriminator}** <@!${entry.user.id}>`,
						`{lang:other.words.reason$ucwords$}: **${entry.reason || "{lang:other.words.none$upper$}"}**`
					].join("\n"));
					break;
				}
			}

			const { entries: b } = await guild.getAuditLog({
				limit: 10,
				actionType: Eris.Constants.AuditLogActions.MEMBER_ROLE_UPDATE
			});
			for (const entry of b) {
				if (entry.targetID === member.id) {
					e.setDescription([
						e.getDescription(),
						"",
						"({lang:other.words.roles})",
						`{lang:other.words.blame$ucwords$}: **${entry.user.username}#${entry.user.discriminator}** <@!${entry.user.id}>`,
						`{lang:other.words.reason$ucwords$}: **${entry.reason || "{lang:other.words.none$upper$}"}**`
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
