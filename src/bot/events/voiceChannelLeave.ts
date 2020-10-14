import Eris from "eris";
import config from "../../config";
import ClientEvent from "../../util/ClientEvent";
import { Colors } from "../../util/Constants";
import db from "../../util/Database";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new ClientEvent("voiceChannelLeave", async function onGuildMemberJoin(member, oldChannel) {
	const { guild } = member;
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(member.guild.id);
	const e = g.logEvents.filter(l => l.type === "voiceLeave");
	for (const log of e) {
		const ch = member.guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !["readMessages", "sendMessages"].some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({ $pull: { logEvents: log } });
			continue;
		}

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setTitle("{lang:other.events.voiceChannelLeave.title}")
			.setDescription([
				`{lang:other.words.user$ucwords$}: **${member.user.username}#${member.user.discriminator}** (${member.user.id})`,
				`{lang:other.words.channel$ucwords$}: **${oldChannel.name}**`
			].join("\n"));

		await ch.createMessage({ embed: e.toJSON() });
	}
});
