import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";

export default new ClientEvent("guildMemberRemove", (async function (this: FurryBot, guild: Eris.Guild, member: Eris.Member) {
	this.increment([
		"events.guildMemberRemove"
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

	const embed: Eris.EmbedOptions = {
		title: "Member Left",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			`Member ${member.username}#${member.discriminator} (<@!${member.id}>) {REPLACE}.`,
			`Account Creation Date: ${this.f.toReadableDate(new Date(member.createdAt)).split(" ").slice(0, 2).join(" ").replace(/-/g, "/")}`
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: this.f.randomColor(),
		thumbnail: {
			url: member.avatarURL
		}
	};

	const log = await this.f.fetchAuditLogEntries(guild, Eris.Constants.AuditLogActions.MEMBER_KICK, member.id);
	if (log.success) {
		embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;
		embed.title = "Member Kicked";
		embed.description = embed.description.replace("{REPLACE}", "was Kicked");
	} embed.description = embed.description.replace("{REPLACE}", "Left");

	return ch.createMessage({ embed });
}));
