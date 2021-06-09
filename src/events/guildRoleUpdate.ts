import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";
import Logger from "logger";

export default new ClientEvent<FurryBot>("guildRoleUpdate", async function (guild, role, oldRole) {
	if (config.beta && !config.eventTest) return;
	const g = await db.getGuild(guild.id).then(v => v.fix());
	const events = g.logEvents.filter(l => l.type === "roleUpdate");

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
			.setColor(Colors.orange)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL ?? config.images.noIcon)
			.setTitle("{lang:other.events.roleUpdate.title}")
			.setDescription(`{lang:other.words.role$ucwords$}: <@&${role.id}>`);

		const content: [old: Array<string>, new: Array<string>] = [
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

		// way too spammy
		/* if (role.position !== oldRole.position) {
			content[0].push(`{lang:other.words.position$ucwords$}: **${oldRole.position}**`);
			content[1].push(`{lang:other.words.position$ucwords$}: **${role.position}**`);
		} */

		if (role.permissions.allow !== oldRole.permissions.allow) {
			content[0].push(`{lang:other.words.permissions$ucwords$}: **[${oldRole.permissions.allow}](https://discordapi.com/permissions.html#${role.permissions.allow})**`);
			content[1].push(`{lang:other.words.permissions$ucwords$}: **[${role.permissions.allow}](https://discordapi.com/permissions.html#${role.permissions.allow})**`);
		}

		// assume no changes happened
		if (!content[0].length && !content[1].length) {
			Logger.warn(`GuildRoleUpdate[${guild.id}]`, "Got update event, but no changes were found. Skipping logging.");
			return;
		}

		if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			const { entries: a } = await guild.getAuditLog({
				limit: 10,
				actionType: Eris.Constants.AuditLogActions.ROLE_UPDATE
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
