import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import { Utility, Time } from "../util/Functions";
import config from "../config";

export default new ClientEvent("guildMemberUpdate", (async function (this: FurryBot, guild: Eris.Guild, member: Eris.Member, oldMember: { roles: string[]; nick: string; }) {
	this.track("events", "guildMemberUpdate");

	if (config.beta && !config.client.betaEventGuilds.includes(guild.id)) return;

	const g = await db.getGuild(guild.id);
	if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
	const e = g.logEvents.find(l => l.type === "memberUpdate");
	if (!e || !e.channel) return;
	if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
	const ch = guild.channels.get<Eris.GuildTextableChannel>(e.channel);
	if (!ch) return g.mongoEdit({ $pull: e });

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
						return `${ch.name}: **${Time.ms((oldMember[c] || 0 as any) * 1000, true)}** -> **${Time.ms((member[c] || 0 as any) * 1000, true)}**`;
						break;
				}
			})))
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: Colors.orange,
		thumbnail: {
			url: member.avatarURL
		}
	};

	if (added.length !== 0) embed.description += `\nAdded Roles: ${added.map(r => `<@&${r}>`).join(", ")}`;
	if (removed.length !== 0) embed.description += `\nRemoved Roles: ${removed.map(r => `<@&${r}>`).join(", ")}`;

	if (changes.includes("nick")) {
		const log = await Utility.fetchAuditLogEntries(this, guild, Eris.Constants.AuditLogActions.MEMBER_UPDATE, member.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;
	} else if (added.length !== 0 || removed.length !== 0) {
		const log = await Utility.fetchAuditLogEntries(this, guild, Eris.Constants.AuditLogActions.MEMBER_ROLE_UPDATE, member.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;
	}
	return ch.createMessage({ embed }).catch(err => null);
}));
