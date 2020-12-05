import Eris from "eris";
import config from "../config";
import ClientEvent from "../util/ClientEvent";
import { Colors } from "../util/Constants";
import db from "../util/Database";
import EmbedBuilder from "../util/EmbedBuilder";
import Utility from "../util/Functions/Utility";
import Logger from "../util/Logger";

export default new ClientEvent("userUpdate", async function (user, oldUser) {
	/* this.counters.push({
		type: "userUpdate",
		time: Date.now()
	}); */
	// if we're getting their events, they should in theory be cached
	const guilds = await this.bot.guilds.filter(g => g.members.has(user.id));
	for (const guild of guilds) {
		if (config.beta && guild.id !== config.client.supportServerId) continue;
		const g = await db.getGuild(guild.id);
		const e = g.logEvents.filter(l => l.type === "userUpdate");

		for (const log of e) {
			const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
			if (!ch || !["readMessages", "sendMessages"].some(p => ch.permissionsOf(this.bot.user.id).has(p))) {
				await g.mongoEdit({
					$pull: {
						logEvents: log
					}
				});
				continue;
			}

			const e = new EmbedBuilder(g.settings.lang)
				.setColor(Colors.orange)
				.setTimestamp(new Date().toISOString())
				.setAuthor(guild.name, guild.iconURL)
				.setTitle("{lang:other.events.userUpdate.title}")
				.setDescription(`{lang:other.words.user$ucwords$}: <@!${user.id}> **${user.username}#${user.discriminator}**`);

			const content: [old: string[], new: string[]] = [
				[],
				[]
			];


			if (user.username !== oldUser.username) {
				content[0].push(`{lang:other.words.name$ucwords$}: **${oldUser.username}**`);
				content[1].push(`{lang:other.words.name$ucwords$}: **${user.username}**`);
			}

			if (user.discriminator !== oldUser.discriminator) {
				content[0].push(`{lang:other.words.discriminator$ucwords$}: **${oldUser.discriminator}**`);
				content[1].push(`{lang:other.words.discriminator$ucwords$}: **${user.discriminator}**`);
			}

			function a(v: string | null) {
				return `https://cdn.discordapp.com/${!v ? `embed/avatars/${Number(user.discriminator) % 5}.png` : `avatars/${user.id}/${v}?size=1024`}`;
			}

			if (user.avatar !== oldUser.avatar) {
				content[0].push("{lang:other.words.avatar$ucwords$}: {lang:other.events.userUpdate.oldAvNote}");
				content[1].push("{lang:other.words.avatar$ucwords$}: {lang:other.events.userUpdate.newAvNote}");
				e
					.setThumbnail(a(oldUser.avatar))
					.setImage(a(user.avatar));
			}

			// assume no changes happened
			if (!content[0].length && !content[1].length) {
				Logger.warn(`UserUpdate[${user.id}]`, "Got update event, but no changes were found. Skipping logging.");
				return;
			}

			await ch.createMessage({
				embed: e
					.addField(
						"{lang:other.words.oldProps$ucwords$}",
						content[0].join("\n") || "{lang:other.words.none$upper$}",
						false
					)
					.addField(
						"{lang:other.words.newProps$ucwords$}",
						content[1].join("\n") || "{lang:other.words.none$upper$}",
						false
					)
					.toJSON()
			});
		}
	}
});
