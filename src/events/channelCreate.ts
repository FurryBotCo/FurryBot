import ClientEvent from "../util/ClientEvent";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { ChannelNames, ChannelNamesCamelCase } from "../util/Constants";

export default new ClientEvent("channelCreate", (async function (this: FurryBot, channel: Eris.AnyChannel) {
	/* await this.a.track("channelCreate", {
		clusterId: this.cluster.id,
		timestamp: Date.now()
	}); */
	this.increment([
		"events.channelCreate",
		`events.channelCreate.${ChannelNamesCamelCase[channel.type]}`
	]);

	if (channel instanceof Eris.GuildChannel) {
		const g = await db.getGuild(channel.guild.id);
		if (!g) return;
		const e = g.logEvents.channelCreate;
		if (!e.enabled || !e.channel) return;
		const ch = channel.guild.channels.get(e.channel) as Eris.Textable;
		if (!ch) return g.edit({
			logEvents: {
				channelCreate: {
					enabled: false,
					channel: null
				}
			}
		});

		const embed: Eris.EmbedOptions = {
			title: "Channel Created",
			author: {
				name: channel.guild.name,
				icon_url: channel.guild.iconURL
			},
			description: [
				`${ChannelNames[channel.type]} Channel Created`,
				`Name: ${[Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_STORE].includes(channel.type as any) ? `<#${channel.id}>` : channel.name} (${channel.id})`
			].join("\n"),
			timestamp: new Date().toISOString()
		};

		const log = await this.f.fetchAuditLogEntries(channel.guild, Eris.Constants.AuditLogActions.CHANNEL_CREATE, channel.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

		return ch.createMessage({ embed });
	}
}));
