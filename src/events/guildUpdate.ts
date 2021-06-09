import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";

export default new ClientEvent<FurryBot>("guildUpdate", async function (guild, oldGuild) {
	if (config.beta && !config.eventTest) return;
	const settings = await db.getGuild(guild.id).then(v => v.fix());
	const events = settings.logEvents.filter(event => event.type === "guildUpdate");

	for (const event of events) {
		const channel = guild.channels.get(event.channel) as Eris.GuildTextableChannel;
		if (!channel || !(["viewChannel", "sendMessages"] as Array<ErisPermissions>).some(perm => channel.permissionsOf(this.bot.user.id).has(perm))) {
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
			.setAuthor(guild.name, guild.iconURL ?? config.images.noIcon);

		const content: [old: Array<string>, new: Array<string>] = [
			[],
			[]
		];

		if (guild.name !== oldGuild.name) {
			content[0].push(`{lang:other.words.name$ucwords$}: **${oldGuild.name}**`);
			content[1].push(`{lang:other.words.name$ucwords$}: **${guild.name}**`);
		}

		if (guild.afkTimeout !== oldGuild.afkTimeout) {
			content[0].push(`{lang:other.words.afk$ucwords$}: **${oldGuild.afkTimeout}ms**`);
			content[1].push(`{lang:other.words.afk$ucwords$}: **${guild.afkTimeout}ms**`);
		}

		if (guild.verificationLevel !== oldGuild.verificationLevel) {
			content[0].push(`{lang:other.words.verification$ucwords$}: **{lang:other.words.verif_level_${oldGuild.verificationLevel}$ucwords$}**`);
			content[1].push(`{lang:other.words.verification$ucwords$}: **{lang:other.words.verif_level_${guild.verificationLevel}$ucwords$}**`);
		}

		if (guild.region !== oldGuild.region) {
			content[0].push(`{lang:other.words.region$ucwords$}: **${oldGuild.region}**`);
			content[1].push(`{lang:other.words.region$ucwords$}: **${guild.region}**`);
		}

		const oldFeatures: Array<string> = [];
		const current: Array<string> = [];

		oldGuild.features.map(feature => guild.features.includes(feature) ? null : current.push(feature));
		guild.features.map(feature => oldGuild.features.includes(feature) ? null : oldFeatures.push(feature));

		if (oldFeatures.length) content[0].push(`{lang:other.words.features$ucwords$}: **${oldFeatures.join(", ")}**`);
		if (current.length) content[1].push(`{lang:other.words.features$ucwords$}: **${current.join(", ")}**`);

		if (guild.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			const { entries: a } = await guild.getAuditLog({
				limit: 10,
				actionType: Eris.Constants.AuditLogActions.GUILD_UPDATE
			});
			for (const entry of a) {
				if (entry.targetID === guild.id) {
					embed.setDescription([
						embed.getDescription(),
						"",
						`{lang:other.words.blame$ucwords$}: **${entry.user.username}#${entry.user.discriminator}** <@!${entry.user.id}>`,
						`{lang:other.words.reason$ucwords$}: **${entry.reason || "{lang:other.words.none$upper$}"}**`
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
