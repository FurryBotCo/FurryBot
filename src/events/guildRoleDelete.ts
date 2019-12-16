import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";

export default new ClientEvent("guildRoleDelete", (async function (this: FurryBot, guild: Eris.Guild, role: Eris.Role) {
	this.increment([
		"events.guildRoleCreate"
	]);
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.roleDelete;
	if (!e.enabled || !e.channel) return;
	const ch = guild.channels.get(e.channel) as Eris.Textable;
	if (!ch) return g.edit({
		logEvents: {
			roleDelete: {
				enabled: false,
				channel: null
			}
		}
	});

	const embed: Eris.EmbedOptions = {
		title: "Role Deleted",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			`Name: ${role.name}`,
			`Mentionable: ${role.mentionable ? "Yes" : "No"}`,
			`Hoisted: ${role.hoist ? "Yes" : "No"}`,
			`Managed: ${role.managed ? "Yes" : "No"}`,
			`Position: ${role.position}`,
			`Color: ${role.color}`
		].join("\n"),
		timestamp: new Date().toISOString()
	};

	const log = await this.f.fetchAuditLogEntries(guild, Eris.Constants.AuditLogActions.ROLE_CREATE, role.id);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed });
}));
