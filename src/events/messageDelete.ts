import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { ChannelNamesCamelCase, Colors, MessageTypes } from "../util/Constants";

export default new ClientEvent("messageDelete", (async function (this: FurryBot, message: Eris.Message) {
	if (!this || !message || !message.author || message.author.bot || ![Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_STORE, Eris.Constants.ChannelTypes.GUILD_TEXT].includes(message.channel.type as any)) return;
	this.increment([
		"events.messageDelete"
	], [`channelType: ${ChannelNamesCamelCase[message.channel.type]}`]);
	const g = await db.getGuild((message.channel as Eris.GuildChannel).guild.id);
	if (!g) return;
	await g.edit({
		snipe: {
			delete: {
				[message.channel.id]: {
					content: message.content,
					authorId: message.author.id,
					time: Date.now()
				}
			}
		}
	}).then(d => d.reload());

	const e = g.logEvents.channelDelete;
	if (!e.enabled || !e.channel) return;
	const ch = (message.channel as Eris.GuildTextableChannel).guild.channels.get(e.channel) as Eris.GuildTextableChannel;
	if (!ch || !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(this.user.id).has(p))) return g.edit({
		logEvents: {
			messageDelete: {
				enabled: false,
				channel: null
			}
		}
	});
	const d = new Date(message.createdAt);

	const embed: Eris.EmbedOptions = {
		title: "Message Deleted",
		author: {
			name: `${message.author.username}#${message.author.discriminator}`,
			icon_url: message.author.avatarURL
		},
		description: [
			`Message by <@!${message.author.id}> was deleted in <#${message.channel.id}>.`,
			`Creation Date: ${d.getMonth()}/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`,
			`Message Type: ${MessageTypes[message.type]}`,
			!message.content ? "Message doesn't seem to have any content, may have attachments or embeds (we don't store either of these)." : message.content
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: Colors.red
	};
	const log = await this.f.fetchAuditLogEntries((message.channel as Eris.GuildTextableChannel).guild, Eris.Constants.AuditLogActions.MESSAGE_DELETE, message.id);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed });
}));
