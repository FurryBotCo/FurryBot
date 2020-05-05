import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import { Utility, Time, Internal } from "../util/Functions";

export default new ClientEvent("guildMemberRemove", (async function (this: FurryBot, guild: Eris.Guild, member: Eris.Member) {
	this.track("events", "guildMemberRemove");
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.memberJoin;
	if (!(!e || !e.enabled || !e.channel)) {
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

		const log = await Utility.fetchAuditLogEntries(this, guild, Eris.Constants.AuditLogActions.MEMBER_KICK, member.id);
		if (log.success) {
			embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;
			embed.title = "Member Kicked";
			embed.description = embed.description.replace("{REPLACE}", "was Kicked");
		} embed.description = embed.description.replace("{REPLACE}", "Left");

		await ch.createMessage({ embed }).catch(err => null);
	}


	if (g.settings.leaveEnabled) {
		if (!g.settings.leaveChannel || !guild.channels.has(g.settings.leaveChannel)) await g.edit({
			settings: {
				leaveEnabled: false,
				leaveChannel: null
			}
		}); else {
			const m = await guild.channels.get<Eris.GuildTextableChannel>(g.settings.leaveChannel).createMessage({
				embed: {
					author: {
						name: `${member.username}#${member.discriminator}`,
						icon_url: member.avatarURL
					},
					title: "Member Left..",
					description: Internal.formatWelcome(g.settings.leaveMessage, member.user, guild),
					timestamp: new Date().toISOString(),
					footer: {
						text: `Joined This Server ${Time.formatAgo(member.joinedAt)} ago`
					},
					color: Colors.red
				}
			}).catch(err => g.edit({
				settings: {
					joinEnabled: false
				}
			}));


			if (g.settings.welcomeDeleteTime !== 0) setTimeout(() => m.delete().catch(err => null), g.settings.welcomeDeleteTime * 1e3);
		}
	}
}));
