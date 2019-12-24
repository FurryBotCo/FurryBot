import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";

export default new ClientEvent("guildRoleUpdate", (async function (this: FurryBot, guild: Eris.Guild, role: Eris.Role, oldRole: Eris.OldRole) {
	this.increment([
		"events.guildRoleUpdate"
	]);

	const g = await db.getGuild(guild.id);
	const e = g.logEvents.roleDelete;
	if (!e.enabled || !e.channel) return;
	const ch = guild.channels.get(e.channel) as Eris.GuildTextableChannel;
	if (!ch || !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(this.user.id).has(p))) return g.edit({
		logEvents: {
			roleDelete: {
				enabled: false,
				channel: null
			}
		}
	});

	const props: { [k: string]: { type: string; name: string; } } = {
		name: {
			type: "string",
			name: "Name"
		},
		color: {
			type: "number",
			name: "Color"
		},
		mentionable: {
			type: "boolean",
			name: "Mentionable"
		},
		managed: {
			type: "boolean",
			name: "Managed"
		},
		position: {
			type: "number",
			name: "Position"
		},
		hoist: {
			type: "boolean",
			name: "Hoist"
		}
	};
	const changes: ("name" | "color" | "mentionable" | "managed" | "position" | "hoist")[] = [];

	if (role.name !== oldRole.name) changes.push("name");
	if (role.color !== oldRole.color) changes.push("color");
	if (role.mentionable !== oldRole.mentionable) changes.push("mentionable");
	if (role.managed !== oldRole.managed) changes.push("managed");
	// if (role.position !== oldRole.position) changes.push("position");
	if (role.hoist !== oldRole.hoist) changes.push("hoist");

	if (changes.length === 0) return;

	const embed: Eris.EmbedOptions = {
		title: "Role Updated",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			`Role: <@&${role.id}> (${role.name})`,
			...(await Promise.all(changes.map(async (c) => {
				const ch = props[c];
				switch (ch.type) {
					case "boolean":
						return `${ch.name}: **${oldRole[c] ? "Yes" : "No"}** -> **${role[c] ? "Yes" : "No"}**`;
						break;

					case "string":
						return `${ch.name}: **${oldRole[c] || "None"}** -> **${role[c] || "None"}**`;
						break;

					case "number":
						return `${ch.name}: **${oldRole[c] || 0}** -> **${role[c] || 0}**`;
						break;

					case "time":
						return `${ch.name}: **${this.f.ms((oldRole[c] || 0 as any) * 1000, true)}** -> **${this.f.ms((role[c] || 0 as any) * 1000, true)}**`;
						break;
				}
			})))
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: Colors.orange
	};

	const log = await this.f.fetchAuditLogEntries(guild, Eris.Constants.AuditLogActions.ROLE_UPDATE, role.id);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed });
}));
