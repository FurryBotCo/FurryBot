import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";
import * as fs from "fs-extra";
import { Time } from "utilities";
import path from "path";
import crypto from "crypto";

export default new ClientEvent<FurryBot>("messageDeleteBulk", async function (messages) {
	if (config.beta && !config.eventTest) return;
	const delCh = this.client.getChannel(messages[0].channel.id) as Eris.GuildTextableChannel;
	if (!delCh || ![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(delCh.type)) return;
	const { guild } = delCh;
	const g = await db.getGuild(delCh.guild.id).then(v => v.fix());
	const events = g.logEvents.filter(l => l.type === "messageDeleteBulk");
	if (events.length === 0) return;
	const dir = path.resolve(config.dir.logs.bulkDelete);
	// @FIXME language
	// @FIXME change message when way to actually change logging is made
	const t = `Bulk Message Delete Report, generated ${Time.formatDateWithPadding()} for guild ${guild.name} (${guild.id})\n\n${messages.map((m: Eris.PossiblyUncachedMessage) => {
		const a = "author" in m ? `${m.author.username}#${m.author.discriminator} (${m.author.id})` : "Unknown Author";
		const d = new Date(Number((BigInt(m.id) / 4194304n) + 1420070400000n));
		return `[${Time.formatDateWithPadding(d, true)} CST] ${a === "Unknown Author" && !("content" in m) ? "Message Not Cached; Cannot Display Content." : `${a}: ${("content" in m && typeof m.content === "undefined" ? "{fetch failed}" : "content" in m && [null, ""].includes(m.content) ? "No Content" : "content" in m && m.content.replace("\n", "\\\u200bn")) as string}`}`;
	}).reverse().join("\n")}\n\n== General Disclaimers ==\nIf you do not want these reports generated when messages are deleted in bulk, disable the logging by running "f!log list" (without quotes, replace "f!" with your servers specific prefix if you have changed it), find the entry id, and remove it.\nThese reports do not expire, and we do not take deletion requests.\nWe cannot support tracking deleted images due to limited server space and copyright reasons.\nMessages that say "Message Not Cached; Cannot Display Content." were made before the bot was launched.\nWe cannot fetch the content of messages that were made before launch. (and we will not store messages to make this possible).`;

	const id = crypto.randomBytes(32).toString("hex");

	fs.writeFileSync(`${dir}/${messages[0].channel.id}-${id}.txt`, t);

	const url = `http${config.web.api.security ? "s" : ""}://${config.web.api.host}:${config.web.api.port}/bulkDelete/${messages[0].channel.id}/${id}`;
	for (const event of events) {
		const ch = guild.channels.get(event.channel) as Eris.GuildTextableChannel;
		if (!ch || !(["viewChannel", "sendMessages"] as Array<ErisPermissions>).some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({
				$pull: {
					logEvents: event
				}
			});
			continue;
		}

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.red)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL ?? config.images.noIcon)
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
