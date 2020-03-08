import ClientEvent from "../util/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import { Utility, Time } from "../util/Functions";

export default new ClientEvent("guildMemberRemove", (async function (this: FurryBot, guild: Eris.Guild, member: Eris.Member) {
	this.increment([
		"events.guildMemberRemove"
	]);
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.memberJoin;
	if (!e.enabled || !e.channel) return;
	const ch = guild.channels.get<Eris.GuildTextableChannel>(e.channel);

	const embed: Eris.EmbedOptions = {
		title: "Member Left",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: [
			`Member ${member.username}#${member.discriminator} (<@!${member.id}>) {REPLACE}.`,
			`Account Creation Date: ${Time.toReadableDate(member.createdAt).split(" ").slice(0, 2).join(" ").replace(/-/g, "/")}`
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: Colors.red,
		thumbnail: {
			url: member.avatarURL
		}
	};

	const log = await Utility.fetchAuditLogEntries(guild, Eris.Constants.AuditLogActions.MEMBER_KICK, member.id);
	if (log.success) {
		embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;
		embed.title = "Member Kicked";
		embed.description = embed.description.replace("{REPLACE}", "was Kicked");
	} embed.description = embed.description.replace("{REPLACE}", "Left");

	return ch.createMessage({ embed }).catch(err => g.edit({
		logEvents: {
			memberJoin: {
				enabled: false,
				channel: null
			}
		}
	}));
}));
