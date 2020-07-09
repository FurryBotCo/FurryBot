import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import * as fs from "fs-extra";
import path from "path";
import { Utility, Time, Strings } from "../util/Functions";

export default new ClientEvent("messageDeleteBulk", (async function (this: FurryBot, messages: Eris.PossiblyUncachedMessage[]) {
	this.track("events", "messageDeleteBulk");
	const c = this.bot.getChannel(messages[0].channel.id) as Eris.GuildTextableChannel;
	if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(c.type)) return;

	if (config.beta && !config.client.betaEventGuilds.includes(c.guild.id)) return;

	const guild = (messages[0].channel as Eris.GuildChannel).guild;
	const g = await db.getGuild(guild.id);
	if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
	const e = g.logEvents.find(l => l.type === "messageBulkDelete");
	if (!e || !e.channel) return;
	if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
	const ch = await this.bot.getRESTChannel(e.channel).catch(err => null) as Eris.GuildTextableChannel;
	if (!ch) return g.mongoEdit({ $pull: e });

	const d = path.resolve(`${config.dir.base}/src/assets/bulkDelete`);
	const t = `Bulk Message Delete Report, generated ${Time.formatDateWithPadding()} for guild ${guild.name} (${guild.id})\n\n${messages.map((m: Eris.Message) => {
		const a = m.author ? `${m.author.username}#${m.author.discriminator} (${m.author.id})` : "Unknown Author";
		const d = new Date(Number((BigInt(m.id) / 4194304n) + 1420070400000n));
		return `[${Time.formatDateWithPadding(d, true)} CST] ${a === "Unknown Author" && !m.content ? "Message Not Cached; Cannot Display Content." : `${a}: ${typeof m.content === "undefined" ? "{fetch failed}" : [null, ""].includes(m.content) ? "No Content" : m.content.replace("\n", "\\\u200bn")}`}`;
	}).reverse().join("\n")}\n\n== General Disclaimers ==\nIf you do not want these reports generated when messages are deleted in bulk, disable the logging by running "f!log disable messageBulkDelete" (without quotes, replace "f!" with your servers specific prefix if you have changed it).\nThese reports do not expire, and we do not have a way to request deletions.\nWe cannot support tracking deleted images due to limited server space and copyright reasons.\nMessages that say "Message Not Cached; Cannot Display Content." were made before the bot was launched.\nWe cannot fetch the content of messages that were made before launch. (and we will not store messages to make this possible).`;

	const id = Strings.random(10);

	fs.writeFileSync(`${d}/${messages[0].channel.id}-${id}.txt`, t);

	const url = `http${config.web.security.useHttps ? "s" : ""}://${config.beta ? `${config.web.api.ip}:${config.web.api.port}` : "botapi.furry.bot"}/bulkDelete/${messages[0].channel.id}/${id}`;

	const embed: Eris.EmbedOptions = {
		title: "Bulk Message Delete",
		author: {
			name: guild.name,
			icon_url: guild.iconURL
		},
		description: `${messages.length} messages deleted in <#${messages[0].channel.id}>\nMessages: [${url}](${url})`,
		timestamp: new Date().toISOString()
	};

	const log = await Utility.fetchAuditLogEntries(this, guild, Eris.Constants.AuditLogActions.MESSAGE_BULK_DELETE, null);
	if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
	else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

	return ch.createMessage({ embed }).catch(err => null);
}));
