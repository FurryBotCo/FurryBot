import Eris from "eris";
import config from "../config";
import ClientEvent from "../util/ClientEvent";
import { Colors } from "../util/Constants";
import db from "../util/Database";
import EmbedBuilder from "../util/EmbedBuilder";

export default new ClientEvent("guildRoleCreate", async function (guild, role) {
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.filter(l => l.type === "roleCreate");

	for (const log of e) {
		const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !["readMessages", "sendMessages"].some(p => ch.permissionsOf(this.bot.user.id).has(p))) {
			await g.mongoEdit({
				$pull: {
					logEvents: log
				}
			});
			continue;
		}

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setTitle("{lang:other.events.roleCreate.title}")
			.setDescription([
				`{lang:other.words.role$ucwords$}: <@&${role.id}>`,
				`{lang:other.words.id$upper$}: **${role.id}**`,
				`{lang:other.words.mentionable$ucwords$}: **${role.mentionable ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`,
				`{lang:other.words.managed$ucwords$}: **${role.managed ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`,
				`{lang:other.words.hoisted$ucwords$}: **${role.hoist ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`,
				`{lang:other.words.color$ucwords$}: **#${role.color ?? "000000"}**`,
				`{lang:other.words.position$ucwords$}: **${role.position}**`,
				`{lang:other.words.permissions$ucwords$}: **[${role.permissions.allow}](https://discordapi.com/permissions.html#${role.permissions.allow})**`
			].join("\n"));

		if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			const { entries: a } = await guild.getAuditLogs(10, null, Eris.Constants.AuditLogActions.ROLE_CREATE);
			for (const log of a) {
				if (log.targetID === role.id) {
					e.setDescription([
						e.getDescription(),
						"",
						`{lang:other.words.blame$ucwords$}: **${log.user.username}#${log.user.discriminator}** <@!${log.user.id}>`,
						`{lang:other.words.reason$ucwords$}: **${log.reason || "{lang:other.words.none$upper$}"}**`
					].join("\n"));
					break;
				}
			}
		}

		await ch.createMessage({ embed: e.toJSON() });
	}
});
