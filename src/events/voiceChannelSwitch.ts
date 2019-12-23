import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";

export default new ClientEvent("voiceChannelSwitch", (async function (this: FurryBot, member: Eris.Member, newChannel: Eris.VoiceChannel, oldChannel: Eris.VoiceChannel) {
	this.increment([
		"events.voiceChannelSwitch"
	]);
	const g = await db.getGuild(member.guild.id);
	const e = g.logEvents.voiceSwitch;
	if (!e.enabled || !e.channel) return;
	const ch = member.guild.channels.get(e.channel) as Eris.GuildTextableChannel;
	if (!ch || !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(this.user.id).has(p))) return g.edit({
		logEvents: {
			voiceSwitch: {
				enabled: false,
				channel: null
			}
		}
	});

	const embed: Eris.EmbedOptions = {
		title: "Member Switched Voice Channels",
		author: {
			name: `${member.username}#${member.discriminator}`,
			icon_url: member.avatarURL
		},
		description: `Member ${member.username}#${member.discriminator} moved from the voice channel ${oldChannel.name} to ${newChannel.name}`,
		timestamp: new Date().toISOString(),
		color: Colors.orange
	};

	const log = await this.f.fetchAuditLogEntries(member.guild, Eris.Constants.AuditLogActions.MEMBER_MOVE, null);
	if (log.success) embed.description += `\nMoved By ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed });
}));
