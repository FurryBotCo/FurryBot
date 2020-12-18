import Eris from "eris";
import config from "../config";
import ClientEvent from "../util/ClientEvent";
import { Colors } from "../util/Constants";
import db from "../util/Database";
import EmbedBuilder from "../util/EmbedBuilder";
import crypto from "crypto";
import path from "path";
import Time from "../util/Functions/Time";
import * as fs from "fs-extra";

export default new ClientEvent("messageDeleteBulk", async function (messages) {
	/* this.counters.push({
		type: "messageDeleteBulk",
		time: Date.now()
	}); */
	const delCh = await this.bot.getChannel(messages[0].channel.id) as Eris.GuildTextableChannel;
	if (!delCh || ![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(delCh.type)) return;
	const { guild } = delCh;
	const g = await db.getGuild(delCh.guild.id);
	const e = g.logEvents.filter(l => l.type === "messageDeleteBulk");
	if (e.length === 0) return;
	const d = path.resolve(config.dir.logs.bulkDelete);
	// @FIXME language
	// @FIXME change message when way to actually change logging is made
	const t = `Bulk Message Delete Report, generated ${Time.formatDateWithPadding()} for guild ${guild.name} (${guild.id})\n\n${messages.map((m: Eris.Message) => {
		const a = m.author ? `${m.author.username}#${m.author.discriminator} (${m.author.id})` : "Unknown Author";
		const d = new Date(Number((BigInt(m.id) / 4194304n) + 1420070400000n));
		return `[${Time.formatDateWithPadding(d, true)} CST] ${a === "Unknown Author" && !m.content ? "Message Not Cached; Cannot Display Content." : `${a}: ${typeof m.content === "undefined" ? "{fetch failed}" : [null, ""].includes(m.content) ? "No Content" : m.content.replace("\n", "\\\u200bn")}`}`;
	}).reverse().join("\n")}\n\n== General Disclaimers ==\nIf you do not want these reports generated when messages are deleted in bulk, disable the logging by running "f!log list" (without quotes, replace "f!" with your servers specific prefix if you have changed it), find the entry id, and remove it.\nThese reports do not expire, and we do not take deletion requests.\nWe cannot support tracking deleted images due to limited server space and copyright reasons.\nMessages that say "Message Not Cached; Cannot Display Content." were made before the bot was launched.\nWe cannot fetch the content of messages that were made before launch. (and we will not store messages to make this possible).`;

	const id = crypto.randomBytes(32).toString("hex");

	fs.writeFileSync(`${d}/${messages[0].channel.id}-${id}.txt`, t);

	const url = `http${config.web.api.security ? "s" : ""}://${config.web.api.host}:${config.web.api.port}/bulkDelete/${messages[0].channel.id}/${id}`;
	for (const log of e) {
		const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !["readMessages", "sendMessages"].some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({ $pull: { logEvents: log } });
			continue;
		}

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.red)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setTitle("{lang:other.events.messageDeleteBulk.title}")
			.setDescription([
				`{lang:other.words.total$ucwords$} {lang:other.words.messages$ucwords$}: **${messages.length}**`,
				`{lang:other.words.channel$ucwords$}: <#${delCh.id}>`,
				`{lang:other.words.log$ucwords$}: ${url}`
			].join("\n"));

		await ch.createMessage({
			embed: e.toJSON()
		});
	}
});
