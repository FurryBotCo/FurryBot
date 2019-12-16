import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";

export default new ClientEvent("guildBanAdd", (async function (this: FurryBot, guild: Eris.Guild, user: Eris.User) {
	this.increment([
		"events.guildBanAdd"
	]);
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.memberBan;
	if (!e.enabled || !e.channel) return;
	const ch = guild.channels.get(e.channel) as Eris.Textable;
	if (!ch) return g.edit({
		logEvents: {
			memberBan: {
				enabled: false,
				channel: null
			}
		}
	});

	const embed: Eris.EmbedOptions = {
		title: "Member Banned",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			`Member ${user.username}#${user.discriminator} (${user.id}) was banned.`
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: this.f.randomColor()
	};

	const log = await this.f.fetchAuditLogEntries(guild, Eris.Constants.AuditLogActions.MEMBER_BAN_ADD, user.id);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed });
}));
