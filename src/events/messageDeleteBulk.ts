import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { ChannelNamesCamelCase } from "../util/Constants";
import short from "short-uuid";
const uuid = short().generate;
import * as fs from "fs-extra";
import path from "path";
import BigInt from "big-integer";

export default new ClientEvent("messageDeleteBulk", (async function (this: FurryBot, messages: Eris.PossiblyUncachedMessage[]) {
	this.increment([
		"events.messageDeleteBulk"
	], [`channelType: ${ChannelNamesCamelCase[messages[0].channel.type]}`]);

	if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(messages[0].channel.type as any)) return;
	const guild = (messages[0].channel as Eris.GuildChannel).guild;
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.roleDelete;
	if (!e.enabled || !e.channel) return;
	const ch = await this.getRESTChannel(e.channel) as Eris.GuildTextableChannel;
	if (!ch || !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(this.user.id).has(p))) return g.edit({
		logEvents: {
			roleDelete: {
				enabled: false,
				channel: null
			}
		}
	});
	const d = path.resolve(`${config.rootDir}/src/assets/bulkDelete`);
	const t = `Bulk Message Delete Report, generated ${this.f.formatDateWithPadding()} for guild ${guild.name} (${guild.id})\n\n${messages.map((m: Eris.Message) => {
		const a = m.author ? `${m.author.username}#${m.author.discriminator} (${m.author.id})` : "Unknown Author";
		const d = new Date(BigInt(m.id).divide("4194304").add("1420070400000").toJSNumber());
		return `[${this.f.formatDateWithPadding(d, false)}] ${a === "Unknown Author" && !m.content ? "Message Not Cached; Cannot Display Content." : `${a}: ${typeof m.content === "undefined" ? "{fetch failed}" : [null, ""].includes(m.content) ? "No Content" : m.content}`}`;
	}).join("\n")}\n\n== General Disclaimers ==\nIf you do not want these reports generated when messages are deleted in bulk, disable the logging by running "f!log disable bulkMessageDelete" (without quotes, replace "f!" with your servers specific prefix if you have changed it).\nThese reports do not expire, and we do not have a way to request deletions.\nWe cannot support tracking deleted images due to limited server space and copyright reasons.\nMessages that say "Message Not Cached; Cannot Display Content." were made before the bot was launched.\nWe cannot fetch the content of messages that were made before launch. (and we will not store messages to make this possible).`;

	const id = uuid();

	fs.writeFileSync(`${d}/${messages[0].channel.id}-${id}.txt`, t);

	const url = `http${config.web.security.useHttps ? "s" : ""}://${config.beta ? `${config.apiBindIp}:${config.apiPort}` : "botapi.furry.bot"}/bulkDelete/${messages[0].channel.id}/${id}`;

	const embed: Eris.EmbedOptions = {
		title: "Bulk Message Delete",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: `${messages.length} messages deleted in <#${messages[0].channel.id}>\nMessages: [${url}](${url})`,
		timestamp: new Date().toISOString()
	};

	const log = await this.f.fetchAuditLogEntries(guild, Eris.Constants.AuditLogActions.MESSAGE_BULK_DELETE, null);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed });
}));
