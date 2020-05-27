import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { ChannelNames, Colors } from "../util/Constants";
import { Utility } from "../util/Functions";

export default new ClientEvent("channelCreate", (async function (this: FurryBot, channel: Eris.AnyChannel) {
	this.track("events", "channelCreate");

	if (channel instanceof Eris.GuildChannel) {
		const g = await db.getGuild(channel.guild.id);
		if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
		const e = g.logEvents.find(l => l.type === "channelCreate");
		if (!e || !e.channel) return;
		if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
		const ch = channel.guild.channels.get<Eris.GuildTextableChannel>(e.channel);
		if (!ch) return g.mongoEdit({ $pull: e });

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
			timestamp: new Date().toISOString(),
			color: Colors.green
		};

		const log = await Utility.fetchAuditLogEntries(this, channel.guild, Eris.Constants.AuditLogActions.CHANNEL_CREATE, channel.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

		return ch.createMessage({ embed }).catch(err => null);
	}
}));
