import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";

export default new ClientEvent<FurryBot>("guildRoleCreate", async function (guild, role) {
	if (config.beta && !config.eventTest) return;
	const g = await db.getGuild(guild.id).then(v => v.fix());
	const events = g.logEvents.filter(l => l.type === "roleCreate");

	for (const event of events) {
		const ch = guild.channels.get(event.channel) as Eris.GuildTextableChannel;
		if (!ch || !(["viewChannel", "sendMessages"] as Array<ErisPermissions>).some(p => ch.permissionsOf(this.bot.user.id).has(p))) {
			await g.mongoEdit({
				$pull: {
					logEvents: event
				}
			});
			continue;
		}

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL ?? config.images.noIcon)
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
			const { entries: a } = await guild.getAuditLog({
				limit: 10,
				actionType: Eris.Constants.AuditLogActions.ROLE_CREATE
			});
			for (const entry of a) {
				if (entry.targetID === role.id) {
					e.setDescription([
						e.getDescription(),
						"",
						`{lang:other.words.blame$ucwords$}: **${entry.user.username}#${entry.user.discriminator}** <@!${entry.user.id}>`,
						`{lang:other.words.reason$ucwords$}: **${entry.reason || "{lang:other.words.none$upper$}"}**`
					].join("\n"));
					break;
				}
			}
		}

		await ch.createMessage({ embed: e.toJSON() });
	}
});
