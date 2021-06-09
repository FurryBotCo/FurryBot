import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";
import { Time } from "utilities";

export default new ClientEvent<FurryBot>("guildMemberRemove", async function (guild, member) {
	if (config.beta && !config.eventTest) return;
	const g = await db.getGuild(guild.id).then(v => v.fix());
	const events = g.logEvents.filter(l => l.type === "memberLeave");
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
			.setThumbnail(member.user.avatarURL)
			.setTitle("{lang:other.events.memberLeft.title}")
			.setDescription([
				`{lang:other.words.member$ucwords$}: **${member.user.username}#${member.user.discriminator}** <@!${member.user.id}>`,
				`{lang:other.words.creationDate$ucwords$}: **${Time.formatDateWithPadding(member.user.createdAt, true, false, true, true)}**`
			].join("\n"));

		if (guild.permissionsOf(this.bot.user.id).has("viewAuditLog")) {
			const { entries: a } = await guild.getAuditLog({
				limit: 10,
				actionType: Eris.Constants.AuditLogActions.MEMBER_KICK
			});
			for (const entry of a) {
				if (entry.targetID === member.id) {
					const v = g.logEvents.filter(ev => ev.type === "userKick");
					inner: for (const l of v) {
						const chh = guild.channels.get(l.channel) as Eris.GuildTextableChannel;
						if (!chh || !(["viewChannel", "sendMessages"] as Array<ErisPermissions>).some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
							await g.mongoEdit({ $pull: { logEvents: l } });
							continue inner;
						}

						const ee = new EmbedBuilder(g.settings.lang)
							.setColor(Colors.gold)
							.setTimestamp(new Date().toISOString())
							.setAuthor(guild.name, guild.iconURL ?? config.images.noIcon)
							.setThumbnail(member.user.avatarURL)
							.setTitle("{lang:other.events.memberLeft.titleKicked}")
							.setDescription([
								`{lang:other.words.user$ucwords$}: **${member.user.username}#${member.user.discriminator}** (${member.user.id})`,
								`{lang:other.words.creationDate$ucwords$}: **${Time.formatDateWithPadding(member.user.createdAt, true, false, true, true)}**`,
								"",
								`{lang:other.words.blame$ucwords$}: **${entry.user.username}#${entry.user.discriminator}** <@!${entry.user.id}>`,
								`{lang:other.words.reason$ucwords$}: **${entry.reason || "{lang:other.words.none$upper$}"}**`
							].join("\n"));

						await ch.createMessage({
							embed: ee.toJSON()
						});
						break;
					}
				}
			}
		}

		await ch.createMessage({ embed: e.toJSON() });
	}
});
