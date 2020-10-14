import ClientEvent from "../../util/ClientEvent";
import config from "../../config";
import { Colors } from "../../util/Constants";
import db from "../../util/Database";
import EmbedBuilder from "../../util/EmbedBuilder";
import Eris from "eris";

export default new ClientEvent("voiceStateUpdate", async function (member, oldState) {
	const { guild } = member;
	if (config.beta && guild.id !== config.client.supportServerId) return;
	const g = await db.getGuild(guild.id);
	const e = g.logEvents.filter(l => l.type === "voiceSwitch");
	for (const log of e) {
		const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !["readMessages", "sendMessages"].some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({ $pull: { logEvents: log } });
			continue;
		}

		const e = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.green)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL)
			.setTitle("{lang:other.events.voiceStateUpdate.title}")
			.setDescription([
				`{lang:other.words.user$ucwords$}: **${member.user.username}#${member.user.discriminator}** <@!${member.user.id}>`
			].join("\n"));

		const content: [old: string[], new: string[]] = [
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
