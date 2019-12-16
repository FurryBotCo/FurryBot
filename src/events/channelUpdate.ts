import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { ChannelNames, ChannelNamesCamelCase } from "../util/Constants";

export default new ClientEvent("channelUpdate", (async function (this: FurryBot, channel: Eris.AnyGuildChannel, oldChannel: Eris.OldGuildChannel) {
	if (!this || !db || !channel || !oldChannel || [Eris.Constants.ChannelTypes.DM, Eris.Constants.ChannelTypes.GROUP_DM].includes(channel.type as any)) return;
	this.increment([
		"events.channelUpdate",
		`events.channelUpdate.${ChannelNamesCamelCase[channel.type]}`
	]);

	if (channel instanceof Eris.GuildChannel) {
		const g = await db.getGuild(channel.guild.id);
		if (!g) return;
		const e = g.logEvents.channelUpdate;
		if (!e.enabled || !e.channel) return;
		const ch = channel.guild.channels.get(e.channel) as Eris.Textable;
		if (!ch) return g.edit({
			logEvents: {
				channelUpdate: {
					enabled: false,
					channel: null
				}
			}
		});
		const props: { [k: string]: { type: string; name: string; } } = {
			nsfw: {
				type: "boolean",
				name: "NSFW"
			},
			name: {
				type: "string",
				name: "Name"
			},
			parentID: {
				type: "string",
				name: "Parent ID"
			},
			topic: {
				type: "string",
				name: "Topic"
			},
			rateLimitPerUser: {
				type: "time",
				name: "User Rate Limit"
			},
			bitrate: {
				type: "number",
				name: "Bit Rate"
			},
			userLimit: {
				type: "number",
				name: "User Limit"
			}
		};
		const changes: ("nsfw" | "name" | "parentID" | "topic" | "rateLimitPerUser" | "bitrate" | "userLimit")[] = [];

		if (channel.nsfw !== oldChannel.nsfw) changes.push("nsfw");
		if (channel.name !== oldChannel.name) changes.push("name");
		if (channel.parentID !== oldChannel.parentID) changes.push("parentID");
		if (channel instanceof Eris.TextChannel || channel instanceof Eris.NewsChannel) {
			if (channel.topic !== oldChannel.topic && (channel.topic !== null && oldChannel.topic !== "")) changes.push("topic");
			if (channel.rateLimitPerUser !== oldChannel.rateLimitPerUser) changes.push("rateLimitPerUser");
		} else if (channel instanceof Eris.VoiceChannel) {
			if (channel.bitrate !== oldChannel.bitrate) changes.push("bitrate");
			// @FIXME when Eris is updated, uncomment this
			// if (channel.userLimit !== oldChannel.userLimit) changes.push("userLimit");
		}

		if (changes.length === 0) return;

		const embed: Eris.EmbedOptions = {
			title: "Channel Updated",
			author: {
				name: channel.guild.name,
				icon_url: channel.guild.iconURL
			},
			description: [
				`${ChannelNames[channel.type]} Channel Update`,
				`Channel: ${channel.name} (${channel.id})`,
				"",
				...(await Promise.all(changes.map(async (c) => {
					const ch = props[c];
					switch (ch.type) {
						case "boolean":
							return `${ch.name}: **${oldChannel[c] ? "Yes" : "No"}** -> **${channel[c] ? "Yes" : "No"}**`;
							break;

						case "string":
							return `${ch.name}: **${oldChannel[c] || "None"}** -> **${channel[c] || "None"}**`;
							break;

						case "number":
							return `${ch.name}: **${oldChannel[c] || 0}** -> **${channel[c] || 0}**`;
							break;

						case "time":
							return `${ch.name}: **${this.f.ms((oldChannel[c] || 0 as any) * 1000, true)}** -> **${this.f.ms((channel[c] || 0) * 1000, true)}**`;
							break;
					}
				})))
			].join("\n"),
			timestamp: new Date().toISOString(),
			color: this.f.randomColor()
		};

		const log = await this.f.fetchAuditLogEntries(channel.guild, Eris.Constants.AuditLogActions.CHANNEL_UPDATE, channel.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

		return ch.createMessage({ embed });
	}
}));
