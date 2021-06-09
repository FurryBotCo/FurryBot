import FurryBot from "../main";
import config from "../config";
import db from "../db";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
import Eris from "eris";
import Logger from "logger";

export default new ClientEvent<FurryBot>("userUpdate", async function (user, oldUser) {
	if (config.beta && !config.eventTest) return;
	// because Eris™️
	if (oldUser === null) return;

	// if we're getting their events, they should in theory be cached
	const guilds = this.client.guilds.filter(g => g.members.has(user.id));
	for (const guild of guilds) {
		if (config.beta && guild.id !== config.client.supportServerId) continue;
		const g = await db.getGuild(guild.id).then(v => v.fix());
		const events = g.logEvents.filter(l => l.type === "userUpdate");

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
				.setColor(Colors.orange)
				.setTimestamp(new Date().toISOString())
				.setAuthor(guild.name, guild.iconURL ?? config.images.noIcon)
				.setTitle("{lang:other.events.userUpdate.title}")
				.setDescription(`{lang:other.words.user$ucwords$}: <@!${user.id}> **${user.username}#${user.discriminator}**`);

			const content: [old: Array<string>, new: Array<string>] = [
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

			// eslint-disable-next-line no-inner-declarations
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
