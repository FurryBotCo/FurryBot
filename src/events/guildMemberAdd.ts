import ClientEvent from "../util/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import { Time, Internal } from "../util/Functions";
import guildRoleDelete from "./guildRoleDelete";

export default new ClientEvent("guildMemberAdd", (async function (this: FurryBot, guild: Eris.Guild, member: Eris.Member) {
	this.increment([
		"events.guildMemberAdd"
	]);
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.memberJoin;
	if (!(!e.enabled || !e.channel)) {
		const ch = guild.channels.get<Eris.GuildTextableChannel>(e.channel);

		const embed: Eris.EmbedOptions = {
			title: "Member Joined",
			author: {
				name: guild.name,
				icon_url: guild.iconURL
			},
			description: [
				`Member ${member.username}#${member.discriminator} (<@!${member.id}>) Joined.`,
				`Account Creation Date: ${Time.toReadableDate(member.createdAt).split(" ").slice(0, 2).join(" ").replace(/-/g, "/")}`
			].join("\n"),
			timestamp: new Date().toISOString(),
			color: Colors.green,
			thumbnail: {
				url: member.avatarURL
			}
		};

		// const log = await Utility.fetchAuditLogEntries(guild, Eris.Constants.AuditLogActions.MEMBER_BAN_REMOVE, user.id);
		// if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		// else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

		await ch.createMessage({ embed }).catch(err => g.edit({
			logEvents: {
				memberJoin: {
					enabled: false,
					channel: null
				}
			}
		}));
	}

	if (g.settings.joinEnabled) {
		if (!g.settings.joinChannel || !guild.channels.has(g.settings.joinChannel)) await g.edit({
			settings: {
				joinEnabled: false,
				joinChannel: null
			}
		}); else {
			const m = await guild.channels.get<Eris.GuildTextableChannel>(g.settings.joinChannel).createMessage({
				embed: {
					author: {
						name: `${member.username}#${member.discriminator}`,
						icon_url: member.avatarURL
					},
					title: "Member Joined!",
					description: Internal.formatWelcome(g.settings.joinMessage, member.user, guild),
					timestamp: new Date().toISOString(),
					footer: {
						text: `Account created ${Time.formatAgo(member.createdAt)} ago`
					},
					color: Colors.gold
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
