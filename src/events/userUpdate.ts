import ClientEvent from "../util/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import { db } from "../modules/Database";

export default new ClientEvent("userUpdate", (async function (this: FurryBot, user: Eris.User, oldUser: { username: string; discriminator: string; avatar?: string; }) {
	this.increment([
		"events.userUpdate"
	]);

	await Promise.all(this.guilds.filter(g => g.members.has(user.id)).map(async (guild) => {
		try {
			const g = await db.getGuild(guild.id);
			if (!g.logEvents.userUpdate) return;
			const ch = guild.channels.get(g.logEvents.userUpdate.channel) as Eris.GuildTextableChannel;
			if (!ch) await g.edit({
				logEvents: {
					userUpdate: {
						enabled: false,
						channel: null
					}
				}
			});

			if (user.username !== oldUser.username) {
				const embed: Eris.EmbedOptions = {
					title: "User Username Changed",
					author: {
						name: `${user.username}#${user.discriminator}`,
						icon_url: user.avatarURL
					},
					description: `<@!${user.id}> has changed their username from **${oldUser.username}** to **${user.username}**.`,
					timestamp: new Date().toISOString(),
					color: Math.floor(Math.random() * 0xFFFFFF)
				};

				await ch.createMessage({ embed });
			}

			if (user.discriminator !== oldUser.discriminator) {
				const embed: Eris.EmbedOptions = {
					title: "User Discriminator Changed",
					author: {
						name: `${user.username}#${user.discriminator}`,
						icon_url: user.avatarURL
					},
					description: `<@!${user.id}> has changed their discriminator from **${oldUser.discriminator}** to **${user.discriminator}**.`,
					timestamp: new Date().toISOString(),
					color: Math.floor(Math.random() * 0xFFFFFF)
				};

				await ch.createMessage({ embed });
			}

			if (user.avatar !== oldUser.avatar) {
				const embed: Eris.EmbedOptions = {
					title: "User Avatar Changed",
					author: {
						name: `${user.username}#${user.discriminator}`,
						icon_url: user.avatarURL
					},
					description: `<@!${user.id}> has changed their avatar. Old: [(thumbnail)](https://cdn.discordapp.com/avatars/${user.id}/${oldUser.avatar}?size=256), New: [(image)](https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=256)`,
					timestamp: new Date().toISOString(),
					color: Math.floor(Math.random() * 0xFFFFFF),
					thumbnail: {
						url: oldUser.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${oldUser.avatar}?size=256` : `https://cdn.discordapp.com/embed/avatars/${parseInt(oldUser.discriminator, 10) % 5}.png`
					},
					image: {
						url: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=256` : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator, 10) % 5}.png`
					}
				};

				await ch.createMessage({ embed }).catch(err => null);
			}
		} catch (e) { }
	}));
}));
