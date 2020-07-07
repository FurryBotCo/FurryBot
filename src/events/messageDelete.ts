import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import Eris from "eris";
import db from "../modules/Database";
import { MessageTypes, Colors } from "../util/Constants";
import { Utility } from "../util/Functions";
import config from "../config";
import { Redis } from "../modules/External";

export default new ClientEvent("messageDelete", (async function (this: FurryBot, message: Eris.Message<Eris.GuildTextableChannel>) {
	this.track("events", "messageDelete");

	if (!this || !message || !message.author || message.author.bot || ![Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_STORE, Eris.Constants.ChannelTypes.GUILD_TEXT].includes(message.channel.type as any)) return;

	if (config.beta && !config.client.betaEventGuilds.includes(message.channel.guild.id)) return;

	const g = await db.getGuild(message.channel.guild.id);
	// tslint:disable-next-line: no-string-literal
	if (typeof g["snipe"] !== "undefined") await g.mongoEdit({
		$unset: {
			snipe: 1
		}
	});

	// auto delete after 30 minutes
	await Redis.SETEX(`${config.beta ? "beta" : "prod"}:snipe:delete:${message.channel.id}:content`, 1800, message.content);
	await Redis.SETEX(`${config.beta ? "beta" : "prod"}:snipe:delete:${message.channel.id}:author`, 1800, message.author.id);
	await Redis.SETEX(`${config.beta ? "beta" : "prod"}:snipe:delete:${message.channel.id}:time`, 1800, Date.now().toString());

	if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
	const e = g.logEvents.find(l => l.type === "messageDelete");
	if (!e || !e.channel) return;
	if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
	const ch = message.channel.guild.channels.get(e.channel) as Eris.GuildTextableChannel;

	if (!ch || ch.guild.id !== message.guildID) return;
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
	const log = await Utility.fetchAuditLogEntries(this, message.channel.guild, Eris.Constants.AuditLogActions.MESSAGE_DELETE, message.id);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed }).catch(err => null);
}));
