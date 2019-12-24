import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";

export default new ClientEvent("voiceChannelLeave", (async function (this: FurryBot, member: Eris.Member, oldChannel: Eris.VoiceChannel) {
	this.increment([
		"events.voiceChannelLeave"
	]);
	const g = await db.getGuild(member.guild.id);
	const e = g.logEvents.voiceLeave;
	if (!e.enabled || !e.channel) return;
	const ch = member.guild.channels.get(e.channel) as Eris.GuildTextableChannel;
	if (!ch || !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(this.user.id).has(p))) return g.edit({
		logEvents: {
			voiceLeave: {
				enabled: false,
				channel: null
			}
		}
	});

	const embed: Eris.EmbedOptions = {
		title: "Member Left A Voice Channel",
		author: {
			name: `${member.username}#${member.discriminator}`,
			icon_url: member.avatarURL
		},
		description: `Member ${member.username}#${member.discriminator} left the voice channel **${oldChannel.name}**`,
		timestamp: new Date().toISOString(),
		color: Colors.red
	};

	return ch.createMessage({ embed });
}));
