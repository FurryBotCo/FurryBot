import Eris from "eris";
import config from "../../config";
import ClientEvent from "../../util/ClientEvent";
import { Colors } from "../../util/Constants";
import db from "../../util/Database";
import EmbedBuilder from "../../util/EmbedBuilder";
import Logger from "../../util/Logger";

export default new ClientEvent("guildRoleUpdate", async function (guild, role, oldRole) {
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.filter(l => l.type === "roleUpdate");

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
			.setColor(Colors.orange)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setTitle("{lang:other.events.roleUpdate.title}")
			.setDescription(`{lang:other.words.role$ucwords$}: <@&${role.id}>`);

		const content: [old: string[], new: string[]] = [
			[],
			[]
		];


		if (role.name !== oldRole.name) {
			content[0].push(`{lang:other.words.name$ucwords$}: **${oldRole.name}**`);
			content[1].push(`{lang:other.words.name$ucwords$}: **${role.name}**`);
		}

		if (role.mentionable !== oldRole.mentionable) {
			content[0].push(`{lang:other.words.mentionable$ucwords$}: **${oldRole.mentionable ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
			content[1].push(`{lang:other.words.mentionable$ucwords$}: **${role.mentionable ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
		}

		// I don't think this can change, but it's in the docs so ¯\_(ツ)_/¯
		if (role.managed !== oldRole.managed) {
			content[0].push(`{lang:other.words.managed$ucwords$}: **${oldRole.managed ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
			content[1].push(`{lang:other.words.managed$ucwords$}: **${role.managed ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
		}

		if (role.hoist !== oldRole.hoist) {
			content[0].push(`{lang:other.words.hoisted$ucwords$}: **${oldRole.hoist ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
			content[1].push(`{lang:other.words.hoisted$ucwords$}: **${role.hoist ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
		}

		if (role.color !== oldRole.color) {
			content[0].push(`{lang:other.words.color$ucwords$}: **#${oldRole.color ?? "000000"}**`);
			content[1].push(`{lang:other.words.color$ucwords$}: **#${role.color ?? "000000"}**`);
		}

		if (role.position !== oldRole.position) {
			content[0].push(`{lang:other.words.position$ucwords$}: **${oldRole.position}**`);
			content[1].push(`{lang:other.words.position$ucwords$}: **${role.position}**`);
		}

		if (role.permissions.allow !== oldRole.permissions.allow) {
			content[0].push(`{lang:other.words.permissions$ucwords$}: **[${oldRole.permissions.allow}](https://discordapi.com/permissions.html#${role.permissions})**`);
			content[1].push(`{lang:other.words.permissions$ucwords$}: **[${role.permissions.allow}](https://discordapi.com/permissions.html#${role.permissions})**`);
		}

		// assume no changes happened
		if (!content[0].length && !content[1].length) {
			Logger.warn(`GuildRoleUpdate[${guild.id}]`, "Got update event, but no changes were found. Skipping logging.");
			return;
		}

		if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			const { entries: a } = await guild.getAuditLogs(10, null, Eris.Constants.AuditLogActions.ROLE_UPDATE);
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
