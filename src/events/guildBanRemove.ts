import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";

export default new ClientEvent("guildBanRemove", (async function (this: FurryBot, guild: Eris.Guild, user: Eris.User) {
	this.increment([
		"events.guildBanRemove"
	]);
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.memberUnban;
	if (!e.enabled || !e.channel) return;
	const ch = guild.channels.get(e.channel) as Eris.GuildTextableChannel;
	if (!ch || !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(this.user.id).has(p))) return g.edit({
		logEvents: {
			memberUnban: {
				enabled: false,
				channel: null
			}
		}
	});

	const embed: Eris.EmbedOptions = {
		title: "Member Unbanned",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			`Member ${user.username}#${user.discriminator} (<@!${user.id}>) was unbanned.`
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: Colors.red
	};

	const log = await this.f.fetchAuditLogEntries(guild, Eris.Constants.AuditLogActions.MEMBER_BAN_REMOVE, user.id);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed });
}));
