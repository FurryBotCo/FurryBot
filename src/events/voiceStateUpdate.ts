import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";

export default new ClientEvent<FurryBot>("voiceStateUpdate", async function (member, oldState) {
	if (config.beta && !config.eventTest) return;
	const { guild } = member;
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(guild.id).then(v => v.fix());
	const events = g.logEvents.filter(l => l.type === "voiceSwitch");
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
			.setTitle("{lang:other.events.voiceStateUpdate.title}")
			.setDescription([
				`{lang:other.words.user$ucwords$}: **${member.user.username}#${member.user.discriminator}** <@!${member.user.id}>`
			].join("\n"));

		const content: [old: Array<string>, new: Array<string>] = [
			[],
			[]
		];

		const voiceState = member.voiceState;
		if (oldState.mute !== voiceState.mute) {
			content[0].push(`{lang:other.words.serverMuted$ucwords$}: **${voiceState.mute ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
			content[1].push(`{lang:other.words.serverMuted$ucwords$}: **${oldState.mute ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
		}

		if (oldState.deaf !== voiceState.deaf) {
			content[0].push(`{lang:other.words.serverDeafened$ucwords$}: **${voiceState.deaf ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
			content[1].push(`{lang:other.words.serverDeafened$ucwords$}: **${oldState.deaf ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
		}

		if (oldState.selfMute !== voiceState.selfMute) {
			content[0].push(`{lang:other.words.userMuted$ucwords$}: **${voiceState.selfMute ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
			content[1].push(`{lang:other.words.userMuted$ucwords$}: **${oldState.selfMute ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
		}

		if (oldState.selfDeaf !== voiceState.selfDeaf) {
			content[0].push(`{lang:other.words.userDeafened$ucwords$}: **${voiceState.selfDeaf ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
			content[1].push(`{lang:other.words.userDeafened$ucwords$}: **${oldState.selfDeaf ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
		}

		if (oldState.selfStream !== voiceState.selfStream) {
			content[0].push(`{lang:other.words.stream$ucwords$}: **${voiceState.selfStream ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
			content[1].push(`{lang:other.words.stream$ucwords$}: **${oldState.selfStream ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}**`);
		}

		// assume no changes happened
		if (!content[0].length && !content[1].length) return;

		await ch.createMessage({
			embed: e
				.addField(
					"{lang:other.words.newProps$ucwords$}",
					content[0].join("\n") || "{lang:other.words.none$upper$}",
					false
				)
				.addField(
					"{lang:other.words.oldProps$ucwords$}",
					content[1].join("\n") || "{lang:other.words.none$upper$}",
					false
				)
				.toJSON()
		});
	}
});
