import Eris from "eris";
import config from "../config";
import ClientEvent from "../util/ClientEvent";
import { Colors } from "../util/Constants";
import db from "../util/Database";
import EmbedBuilder from "../util/EmbedBuilder";
import Time from "../util/Functions/Time";
import Logger from "../util/Logger";

export default new ClientEvent("channelUpdate", async function (channel, oldChannel) {
	if (config.beta && !config.eventTest) return;
	if (channel instanceof Eris.GuildChannel) {
		const { guild } = channel;
		if (config.beta && guild.id !== config.client.supportServerId) return;
		const g = await db.getGuild(guild.id);
		const e = g.logEvents.filter(l => l.type === "channelUpdate");

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
				.setColor(Colors.orange)
				.setTimestamp(new Date().toISOString())
				.setAuthor(guild.name, guild.iconURL)
				.setTitle("{lang:other.events.channelUpdate.title}")
				.setDescription(`{lang:other.words.channel$ucwords$}: <#${channel.id}>`);

			const content: [old: string[], new: string[]] = [
				[],
				[]
			];

			if (channel.type !== oldChannel.type) {
				content[1].push(`{lang:other.words.type$ucwords$}: **{lang:other.channelType.${channel.type}}**`);
				content[0].push(`{lang:other.words.type$ucwords$}: **{lang:other.channelType.${oldChannel.type}}**`);
			}

			if (channel.name !== oldChannel.name) {
				content[1].push(`{lang:other.words.name$ucwords$}: **${channel.name}**`);
				content[0].push(`{lang:other.words.name$ucwords$}: **${oldChannel.name}**`);
			}

			if (channel.parentID !== oldChannel.parentID) {
				content[1].push(`{lang:other.words.parent$ucwords$}: **${!channel.parentID ? "{lang:other.words.none$upper$}" : guild.channels.get(channel.parentID).name}**`);
				content[0].push(`{lang:other.words.parent$ucwords$}: **${!oldChannel.parentID ? "{lang:other.words.none$upper$}" : guild.channels.get(oldChannel.parentID).name}**`);
			}

			// it's provided as a number, but the typings say "string"
			// asked for it to be changed
			if (channel.position !== Number(oldChannel.position)) {
				content[1].push(`{lang:other.words.position$ucwords$}: **${channel.position}**`);
				content[0].push(`{lang:other.words.position$ucwords$}: **${oldChannel.position}**`);
			}

			if (channel.nsfw !== oldChannel.nsfw) {
				content[1].push(`{lang:other.words.nsfw$upper$}: **{lang:other.words.${channel.nsfw ? "yes" : "no"}$ucwords$}**`);
				content[0].push(`{lang:other.words.nsfw$upper$}: **{lang:other.words.${oldChannel.nsfw ? "yes" : "no"}$ucwords$}**`);
			}

			switch (channel.type) {
				case Eris.Constants.ChannelTypes.GUILD_TEXT:
				case Eris.Constants.ChannelTypes.GUILD_NEWS: {
					// Discord can return different things randomly, so we fix them here
					if (channel.rateLimitPerUser === null) channel.rateLimitPerUser = 0;
					if (oldChannel.rateLimitPerUser === null) oldChannel.rateLimitPerUser = 0;

					if (channel.topic === null) channel.topic = "";
					if (oldChannel.topic === null) oldChannel.topic = "";

					if (channel.rateLimitPerUser !== oldChannel.rateLimitPerUser) {
						content[0].push(`{lang:other.words.rateLimit$ucwords$}: **${[0, null].includes(oldChannel.rateLimitPerUser) ? "{lang:other.words.none$upper$}" : Time.ms(oldChannel.rateLimitPerUser * 1000)}**`);
						content[1].push(`{lang:other.words.rateLimit$ucwords$}: **${[0, null].includes(channel.rateLimitPerUser) ? "{lang:other.words.none$upper$}" : Time.ms(channel.rateLimitPerUser * 1000)}**`);
					}
					if (channel.topic !== oldChannel.topic) {
						content[0].push(`{lang:other.words.topic$ucwords$}: **${oldChannel.topic === null ? "{lang:other.words.none$upper$}" : oldChannel.topic}**`);
						content[1].push(`{lang:other.words.topic$ucwords$}: **${channel.topic === null ? "{lang:other.words.none$upper$}" : channel.topic}**`);
					}
					break;
				}

				case Eris.Constants.ChannelTypes.GUILD_VOICE: {
					if (channel.userLimit !== oldChannel.userLimit) {
						content[0].push(`{lang:other.words.userLimit$ucwords$}: **${oldChannel.userLimit || "{lang:other.words.unlimited$upper$}"}**`);
						content[1].push(`{lang:other.words.userLimit$ucwords$}: **${channel.userLimit || "{lang:other.words.unlimited$upper$}"}**`);
					}

					if (channel.bitrate !== oldChannel.bitrate) {
						content[0].push(`{lang:other.words.bitrate$ucwords$}: **${oldChannel.bitrate}kbps**`);
						content[1].push(`{lang:other.words.bitrate$ucwords$}: **${channel.bitrate}kbps**`);
					}
					break;
				}
			}

			if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
				const { entries: a } = await guild.getAuditLogs(10, null, Eris.Constants.AuditLogActions.CHANNEL_UPDATE);
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

			// assume no changes happened
			if (!content[0].length && !content[1].length) {
				Logger.warn(`ChannelUpdate[${guild.id}]`, "Got update event, but no changes were found. Skipping logging.");
				return;
			}

			await ch.createMessage({
				embed: e
					.addField(
						"{lang:other.words.oldProps$ucwords$}",
						content[0].join("\n") || "{lang:other.words.none$upper$}",
						false
					)
					.addField(
						"{lang:other.words.newProps$ucwords$}",
						content[1].join("\n") || "{lang:other.words.none$upper$}",
						false
					)
					.toJSON()
			});
		}
	}
});
