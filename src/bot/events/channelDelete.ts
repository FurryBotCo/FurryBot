import Eris from "eris";
import config from "../../config";
import ClientEvent from "../../util/ClientEvent";
import { Colors } from "../../util/Constants";
import db from "../../util/Database";
import EmbedBuilder from "../../util/EmbedBuilder";
import Time from "../../util/Functions/Time";

export default new ClientEvent("channelDelete", async function (channel) {
	if (channel instanceof Eris.GuildChannel) {
		const { guild } = channel;
		if (config.beta && guild.id !== config.client.supportServerId) return;
		const g = await db.getGuild(guild.id);
		const e = g.logEvents.filter(l => l.type === "channelDelete");

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
				.setTitle("{lang:other.events.channelDelete.title}")
				.setDescription([
					`{lang:other.words.type$ucwords$}: **{lang:other.channelType.${channel.type}}**`,
					`{lang:other.words.name$ucwords$}: **${channel.name}**`,
					`{lang:other.words.parent$ucwords$}: **${!channel.parentID ? "{lang:other.words.none$upper$}" : guild.channels.get(channel.parentID).name}**`,
					`{lang:other.words.position$ucwords$}: **${channel.position}**`,
					`{lang:other.words.nsfw$upper$}: **{lang:other.words.${channel.nsfw ? "yes" : "no"}$ucwords$}**`
				].join("\n"));

			switch (channel.type) {
				case Eris.Constants.ChannelTypes.GUILD_TEXT:
				case Eris.Constants.ChannelTypes.GUILD_NEWS: {
					e.setDescription([
						e.getDescription(),
						`{lang:other.words.rateLimit$ucwords$}: **${[0, null].includes(channel.rateLimitPerUser) ? "{lang:other.words.none$upper$}" : Time.ms(channel.rateLimitPerUser * 1000)}**`,
						`{lang:other.words.topic$ucwords$}: **${channel.topic === null ? "{lang:other.words.none$upper$}" : channel.topic}**`
					].join("\n"));
					break;
				}

				case Eris.Constants.ChannelTypes.GUILD_VOICE: {
					e.setDescription([
						e.getDescription(),
						`{lang:other.words.userLimit$ucwords$}: **${channel.userLimit || "{lang:other.words.unlimited$upper$}"}**`,
						`{lang:other.words.bitrate$ucwords$}: **${channel.bitrate}kbps**`
					].join("\n"));
					break;
				}
			}

			if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
				const { entries: a } = await guild.getAuditLogs(10, null, Eris.Constants.AuditLogActions.CHANNEL_DELETE);
				for (const log of a) {
					if (log.targetID === channel.id) {
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
	}
});
