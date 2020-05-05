import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";

export default new ClientEvent("voiceChannelLeave", (async function (this: FurryBot, member: Eris.Member, oldChannel: Eris.VoiceChannel) {
	this.track("events", "voiceChannelLeave");
	const g = await db.getGuild(member.guild.id);
	const e = g.logEvents.voiceLeave;
	if (!e.enabled || !e.channel) return;
	const ch = member.guild.channels.get<Eris.GuildTextableChannel>(e.channel);

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

	return ch.createMessage({ embed }).catch(err => null);
}));
