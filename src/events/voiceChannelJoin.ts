import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import config from "../config";

export default new ClientEvent("voiceChannelJoin", (async function (this: FurryBot, member: Eris.Member, newChannel: Eris.VoiceChannel) {
	this.track("events", "voiceChannelJoin");

	if (config.beta && !config.client.betaEventGuilds.includes(member.guild.id)) return;

	const g = await db.getGuild(member.guild.id);
	if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
	const e = g.logEvents.find(l => l.type === "voiceJoin");
	if (!e || !e.channel) return;
	if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
	const ch = member.guild.channels.get<Eris.GuildTextableChannel>(e.channel);
	if (!ch) return g.mongoEdit({ $pull: e });

	const embed: Eris.EmbedOptions = {
		title: "Member Joined Voice Channel",
		author: {
			name: `${member.username}#${member.discriminator}`,
			icon_url: member.avatarURL
		},
		description: `Member ${member.username}#${member.discriminator} joined the voice channel **${newChannel.name}**`,
		timestamp: new Date().toISOString(),
		color: Colors.green
	};

	return ch.createMessage({ embed }).catch(err => null);
}));
