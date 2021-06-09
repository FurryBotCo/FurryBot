import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";

export default new ClientEvent<FurryBot>("guildBanAdd", async function (guild, user) {
	if (config.beta && !config.eventTest) return;
	const g = await db.getGuild(guild.id).then(v => v.fix());
	const events = g.logEvents.filter(l => l.type === "memberBan");

	for (const event of events) {
		const ch = guild.channels.get(event.channel) as Eris.GuildTextableChannel;
		if (!ch || !(["viewChannel", "sendMessages"] as Array<ErisPermissions>).some(p => ch.permissionsOf(this.bot.user.id).has(p))) {
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
			.setTitle("{lang:other.events.guildBanAdd.title}")
			.setDescription([
				`{lang:other.words.target$ucwords$}: ${user.username}#${user.discriminator} (<@!${user.id}>)`
			].join("\n"));

		if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			const { entries: a } = await guild.getAuditLog({
				limit: 10,
				actionType: Eris.Constants.AuditLogActions.MEMBER_BAN_ADD
			});
			for (const entry of a) {
				if (entry.targetID === user.id) {
					e.setDescription([
						e.getDescription(),
						"",
						`{lang:other.words.blame$ucwords$}: **${entry.user.username}#${entry.user.discriminator}** <@!${entry.user.id}>`,
						`{lang:other.words.reason$ucwords$}: **${entry.reason || "{lang:other.words.none$upper$}"}**`
					].join("\n"));
					break;
				}
			}
		}

		await ch.createMessage({
			embed: e.toJSON()
		});
	}
});
