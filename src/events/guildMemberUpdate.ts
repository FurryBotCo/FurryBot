import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";

export default new ClientEvent("guildMemberUpdate", (async function (this: FurryBot, guild: Eris.Guild, member: Eris.Member, oldMember: { roles: string[]; nick: string; }) {
	this.increment([
		"events.guildMemberUpdate"
	]);
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.memberJoin;
	if (!e.enabled || !e.channel) return;
	const ch = guild.channels.get(e.channel) as Eris.Textable;
	if (!ch) return g.edit({
		logEvents: {
			memberJoin: {
				enabled: false,
				channel: null
			}
		}
	});

	const props: { [k: string]: { type: string; name: string; } } = {
		nick: {
			type: "string",
			name: "Nickname"
		}
	};
	const changes: ("nick")[] = [];

	const removed: string[] = [];
	const added: string[] = [];

	member.roles.map(r => oldMember.roles.includes(r) ? null : added.push(r));
	oldMember.roles.map(r => member.roles.includes(r) ? null : removed.push(r));

	if (member.nick !== oldMember.nick) changes.push("nick");

	if (changes.length === 0 && added.length === 0 && removed.length === 0) return;

	const embed: Eris.EmbedOptions = {
		title: "Member Updated",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			`Member: <@!${member.id}> (${member.username}#${member.discriminator})`,
			...(await Promise.all(changes.map(async (c) => {
				const ch = props[c];
				switch (ch.type) {
					case "boolean":
						return `${ch.name}: **${oldMember[c] ? "Yes" : "No"}** -> **${member[c] ? "Yes" : "No"}**`;
						break;

					case "string":
						return `${ch.name}: **${oldMember[c] || "None"}** -> **${member[c] || "None"}**`;
						break;

					case "number":
						return `${ch.name}: **${oldMember[c] || 0}** -> **${member[c] || 0}**`;
						break;

					case "time":
						return `${ch.name}: **${this.f.ms((oldMember[c] || 0 as any) * 1000, true)}** -> **${this.f.ms((member[c] || 0 as any) * 1000, true)}**`;
						break;
				}
			})))
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: this.f.randomColor(),
		thumbnail: {
			url: member.avatarURL
		}
	};

	if (added.length !== 0) embed.description += `\nAdded Roles: ${added.map(r => `<@&${r}>`).join(", ")}`;
	if (removed.length !== 0) embed.description += `\nRemoved Roles: ${removed.map(r => `<@&${r}>`).join(", ")}`;

	if (changes.includes("nick")) {
		const log = await this.f.fetchAuditLogEntries(guild, Eris.Constants.AuditLogActions.MEMBER_UPDATE, member.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;
	} else if (added.length !== 0 || removed.length !== 0) {
		const log = await this.f.fetchAuditLogEntries(guild, Eris.Constants.AuditLogActions.MEMBER_ROLE_UPDATE, member.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;
	}
	return ch.createMessage({ embed });
}));
