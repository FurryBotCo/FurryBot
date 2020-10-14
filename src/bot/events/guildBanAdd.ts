import Eris from "eris";
import config from "../../config";
import ClientEvent from "../../util/ClientEvent";
import { Colors } from "../../util/Constants";
import db from "../../util/Database";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new ClientEvent("guildBanAdd", async function (guild, user) {
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.filter(l => l.type === "memberBan");

	for (const log of e) {
		const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !["readMessages", "sendMessages"].some(p => ch.permissionsOf(this.bot.user.id).has(p))) {
			await g.mongoEdit({
				$pull: {
					logEvents: log
				}
			});
			continue;
		}

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.red)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setTitle("{lang:other.events.guildBanAdd.title}")
			.setDescription([
				`{lang:other.words.target$ucwords$}: ${user.username}#${user.discriminator} (<@!${user.id}>)`
			].join("\n"));

		if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			const { entries: a } = await guild.getAuditLogs(10, null, Eris.Constants.AuditLogActions.MEMBER_BAN_ADD);
			for (const log of a) {
				if (log.targetID === user.id) {
					e.setDescription([
						e.getDescription(),
						"",
						`{lang:other.words.blame$ucwords$}: **${log.user.username}#${log.user.discriminator}** <@!${log.user.id}>`,
						`{lang:other.words.reason$ucwords$}: **${log.reason || "{lang:other.words.none$upper$}"}**`
					].join("\n"));
					break;
				}
			}
		}

		await ch.createMessage({
			embed: e.toJSON()
		});
	}
});
