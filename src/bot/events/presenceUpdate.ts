import Eris from "eris";
import config from "../../config";
import ClientEvent from "../../util/ClientEvent";
import { Colors, GAME_TYPES } from "../../util/Constants";
import db from "../../util/Database";
import EmbedBuilder from "../../util/EmbedBuilder";
import Logger from "../../util/Logger";

export default new ClientEvent("presenceUpdate", async function (other, oldPresence) {
	if (other instanceof Eris.Member) {
		const { guild } = other;
		if (config.beta && guild.id !== config.client.supportServerId) return;
		const g = await db.getGuild(guild.id);
		const e = g.logEvents.filter(l => l.type === "presenceUpdate");
		for (const log of e) {
			const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
			if (!ch || !["readMessages", "sendMessages"].some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
				await g.mongoEdit({ $pull: { logEvents: log } });
				continue;
			}

			// game/activities is a TODO
			/*function k(t: (typeof GAME_TYPES)[keyof typeof GAME_TYPES]) {

			}*/

			function c(cs: Eris.ClientStatus, s: Eris.Status) {
				if (cs.desktop === s) return "desktop";
				else if (cs.mobile === s) return "mobile";
				else if (cs.web === s) return "web";
				else return "unknown";
			}

			const oldPrs = [], newPrs = [];

			// @TODO
			if (oldPresence.game) { }

			if (oldPresence.status) oldPrs.push(
				`{lang:other.words.status$ucwords$}: <:${config.emojis.status[oldPresence.status]}> {lang:other.words.${oldPresence.status}$ucwords$}`
			);

			if (oldPresence.clientStatus) oldPrs.push(
				`{lang:other.words.device$ucwords$}: **{lang:other.words.${c(oldPresence.clientStatus, oldPresence.status)}$ucwords$}**`
			);

			if (other.status) newPrs.push(
				`{lang:other.words.status$ucwords$}: <:${config.emojis.status[other.status]}> {lang:other.words.${other.status}$ucwords$}`
			);

			// @TODO
			if (other.game) { }

			if (other.clientStatus) newPrs.push(
				`{lang:other.words.device$ucwords$}: **{lang:other.words.${c(other.clientStatus, other.status)}$ucwords$}**`
			);


			const e = new EmbedBuilder(g.settings.lang)
				.setColor(Colors.gold)
				.setTimestamp(new Date().toISOString())
				.setAuthor(guild.name, guild.iconURL)
				.setTitle("{lang:other.events.presenceUpdate.title}")
				.setDescription([
					`{lang:other.words.user$ucwords$}: **${other.user.username}#${other.user.discriminator}** <@!${other.user.id}>`
				].join("\n"))
				.addField(
					"{lang:other.words.old$ucwords$} {lang:other.words.presence$ucwords$}",
					oldPrs.join("\n") || "{lang:other.words.none$upper$}",
					false
				)
				.addField(
					"{lang:other.words.new$ucwords$} {lang:other.words.presence$ucwords$}",
					newPrs.join("\n") || "{lang:other.words.none$upper$}",
					false
				);

			await ch.createMessage({
				embed: e.toJSON()
			});
		}
	}
});
