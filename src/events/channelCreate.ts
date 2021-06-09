import config from "../config";
import FurryBot from "../main";
import db from "../db";
import Eris from "eris";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import { Time } from "utilities";

export default new ClientEvent<FurryBot>("channelCreate", async function (channel) {
	if (config.beta && !config.eventTest) return;
	if (channel instanceof Eris.GuildChannel) {
		const { guild } = channel;
		if (config.beta && guild.id !== config.client.supportServerId) return;
		const g = await db.getGuild(guild.id).then(v => v.fix());
		const events = g.logEvents.filter(l => l.type === "channelCreate");

		for (const event of events) {
			const ch = guild.channels.get(event.channel) as Eris.GuildTextableChannel;
			if (!ch || !(["viewChannel", "sendMessages"] as Array<ErisPermissions>).some(p => ch.permissionsOf(this.bot.user.id).has(p))) {
				await g.mongoEdit({
					$pull: {
						logEvents: event
					}
				});
				continue;
			}

			const e = new EmbedBuilder(g.settings.lang)
				.setColor(Colors.green)
				.setTimestamp(new Date().toISOString())
				.setAuthor(guild.name, guild.iconURL ?? config.images.noIcon)
				.setTitle("{lang:other.events.channelCreate.title}")
				.setDescription([
					`{lang:other.words.type$ucwords$}: **{lang:other.channelType.${channel.type}}**`,
					`{lang:other.words.name$ucwords$}: **${channel.name}**`,
					`{lang:other.words.parent$ucwords$}: **${!channel.parentID ? "{lang:other.words.none$upper$}" : guild.channels.get(channel.parentID)!.name}**`,
					`{lang:other.words.position$ucwords$}: **${channel.position}**`,
					`{lang:other.words.nsfw$upper$}: **{lang:other.words.${channel.nsfw ? "yes" : "no"}$ucwords$}**`
				].join("\n"));

			switch (channel.type) {
				case Eris.Constants.ChannelTypes.GUILD_TEXT:
				case Eris.Constants.ChannelTypes.GUILD_NEWS: {
					e.setDescription([
						e.getDescription(),
						`{lang:other.words.rateLimit$ucwords$}: **${!channel.rateLimitPerUser ? "{lang:other.words.none$upper$}" : Time.ms(channel.rateLimitPerUser * 1000)}**`,
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

			if (guild.permissionsOf(this.bot.user.id).has("viewAuditLog")) {
				const { entries: a } = await guild.getAuditLog({
					limit: 10,
					actionType: Eris.Constants.AuditLogActions.CHANNEL_CREATE
				});
				for (const entry of a) {
					if (entry.targetID === channel.id) {
						e.setDescription([
							e.getDescription(),
							"",
							`{lang:other.words.blame$ucwords$}: **${entry.user.username}#${entry.user.discriminator}** <@!${entry.user.id}>`,
							`{lang:other.words.reason$ucwords$}: **${entry.reason || "{lang:other.words.none$upper$}"}**`
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
