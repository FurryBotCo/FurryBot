import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";

export default new ClientEvent<FurryBot>("voiceChannelJoin", async function (member, channel) {
	if (config.beta && !config.eventTest) return;
	const { guild } = member;
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(guild.id).then(v => v.fix());
	const events = g.logEvents.filter(l => l.type === "voiceJoin");
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
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL ?? config.images.noIcon)
			.setTitle("{lang:other.events.voiceChannelJoin.title}")
			.setDescription([
				`{lang:other.words.user$ucwords$}: **${member.user.username}#${member.user.discriminator}** (${member.user.id})`,
				`{lang:other.words.channel$ucwords$}: **${channel.name}**`
			].join("\n"));

		await ch.createMessage({ embed: e.toJSON() });
	}
});
