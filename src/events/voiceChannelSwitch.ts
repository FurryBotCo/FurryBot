import ClientEvent from "../util/ClientEvent";
import config from "../config";
import { Colors } from "../util/Constants";
import db from "../util/Database";
import EmbedBuilder from "../util/EmbedBuilder";
import Eris from "eris";

export default new ClientEvent("voiceChannelSwitch", async function (member, newChannel, oldChannel) {
	const { guild } = member;
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(member.guild.id);
	const e = g.logEvents.filter(l => l.type === "voiceSwitch");
	for (const log of e) {
		const ch = member.guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !["readMessages", "sendMessages"].some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({ $pull: { logEvents: log } });
			continue;
		}

		// improve this when dono asks - August
		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setTitle("{lang:other.events.voiceChannelSwitch.title}")
			.setDescription([
				`{lang:other.words.user$ucwords$}: **${member.user.username}#${member.user.discriminator}** (${member.user.id})`,
				`{lang:other.words.channel$ucwords$}: **${oldChannel.name} -> ${newChannel.name}**`
			].join("\n"));

		await ch.createMessage({ embed: e.toJSON() });
	}
});
