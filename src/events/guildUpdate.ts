import { Colors } from "../util/Constants";
import db from "../util/Database";
import EmbedBuilder from "../util/EmbedBuilder";
import ClientEvent from "../util/ClientEvent";
import Eris from "eris";

export default new ClientEvent("guildUpdate", async function (guild, old) {
	const settings = await db.getGuild(guild.id);
	const events = settings.logEvents.filter(event => event.type === "guildUpdate");

	for (const event of events) {
		const channel = guild.channels.get(event.channel) as Eris.GuildTextableChannel;
		if (!channel || !["readMessages", "sendMessages"].some(perm => channel.permissionsOf(this.bot.user.id).has(perm))) {
			await settings.mongoEdit({
				$pull: {
					logEvents: event
				}
			});

			continue;
		}

		const embed = new EmbedBuilder(settings.settings.lang)
			.setTitle("{lang:other.events.guildUpdate.title}")
			.setColor(Colors.orange)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL);

		const content: [old: string[], new: string[]] = [
			[],
			[]
		];

		if (guild.name !== old.name) {
			content[0].push(`{lang:other.words.name$ucwords$}: **${old.name}**`);
			content[1].push(`{lang:other.words.name$ucwords$}: **${guild.name}**`);
		}

		if (guild.afkTimeout !== old.afkTimeout) {
			content[0].push(`{lang:other.words.afk$ucwords$}: **${old.afkTimeout}ms**`);
			content[1].push(`{lang:other.words.afk$ucwords$}: **${guild.afkTimeout}ms**`);
		}

		if (guild.verificationLevel !== old.verificationLevel) {
			content[0].push(`{lang:other.words.verification$ucwords$}: **{lang:other.words.verif_level.${old.verificationLevel}$ucwords$}**`);
			content[1].push(`{lang:other.words.verification$ucwords$}: **{lang:other.words.verif_level.${guild.verificationLevel}$ucwords$}**`);
		}

		if (guild.region !== old.region) {
			content[0].push(`{lang:other.words.region$ucwords$}: **${old.region}**`);
			content[1].push(`{lang:other.words.region$ucwords$}: **${guild.region}**`);
		}

		const oldFeatures: string[] = [];
		const current: string[] = [];

		old.features.map(feature => guild.features.includes(feature) ? null : current.push(feature));
		guild.features.map(feature => old.features.includes(feature) ? null : oldFeatures.push(feature));

		if (oldFeatures.length) content[0].push(`{lang:other.words.features$ucwords$}: **${oldFeatures.join(', ')}**`);
		if (current.length) content[1].push(`{lang:other.words.features$ucwords$}: **${current.join(', ')}**`);

		if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			const { entries: a } = await guild.getAuditLogs(10, null, Eris.Constants.AuditLogActions.GUILD_UPDATE);
			for (const log of a) {
				if (log.targetID === guild.id) {
					embed.setDescription([
						embed.getDescription(),
						"",
						`{lang:other.words.blame$ucwords$}: **${log.user.username}#${log.user.discriminator}** <@!${log.user.id}>`,
						`{lang:other.words.reason$ucwords$}: **${log.reason || "{lang:other.words.none$upper$}"}**`
					].join("\n"));
					break;
				}
			}
		}

		await channel.createMessage({
			embed: embed
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
