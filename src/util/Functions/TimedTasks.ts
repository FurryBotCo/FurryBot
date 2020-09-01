import { mdb, db } from "../Database";
import UserConfig from "../config/UserConfig";
import config from "../../config";
import FurryBot from "../../bot";
import { Colors } from "../Constants";
import GuildConfig from "../config/GuildConfig";
import Eris from "eris";
import Internal from "./Internal";
import DailyJoins from "../handlers/DailyJoinsHandler";
import Logger from "../Logger";

export default class TimedTasks {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	static async runAll(client: FurryBot) {
		const d = new Date();
		if (d.getSeconds() === 0) {
			if (d.getMinutes() === 0) {
				await this.runDeleteUsers(client).then(() => Logger.debug("Timed Tasks |  Delete Users", "Finished processing."));
				await this.runDeleteGuilds(client).then(() => Logger.debug("Timed Tasks |  Delete Guilds", "Finished processing."));
			}

			if (!config.beta && d.getHours() === 0 && d.getMinutes() === 0) await this.runDailyJoins(client).then(() => Logger.debug("Timed Tasks | Daily Joins", "Finished processing."));
		}

		// await this.runAutoServerActions(client); // .then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Actions"));
	}


	static async runDeleteUsers(client: FurryBot) {
		const d = await mdb.collection<UserConfig>("users").find({
			$and: [
				{ deletion: { $ne: 0 } },
				{ deletion: { $ne: null } }
			]
		}).toArray();

		if (d.length === 0) {
			if (config.beta) Logger.debug("Timed Tasks |  Delete Users", "No processable entries found.");
			return;
		}

		await Promise.all(d.map(async (u) => {
			const s = await client.bot.getRESTUser(u.id);

			await s.getDMChannel().then(dm => dm.createMessage({
				embed: {
					title: "Data Deleted",
					description: "Your data has been purged from our database. Please note: if you send a message in another server that has me in it, a new user entry will be created.",
					timestamp: new Date().toISOString(),
					color: Colors.green
				}
			})).catch(err => null);

			await mdb.collection<UserConfig>("users").findOneAndDelete({ id: u.id });
			Logger.debug("Timed Tasks |  Delete Users", `Deleted the user "${u.id}"`);
		}));
	}

	static async runDeleteGuilds(client: FurryBot) {
		const d = await mdb.collection<GuildConfig>("guilds").find({
			$and: [
				{ deletion: { $ne: 0 } },
				{ deletion: { $ne: null } }
			]
		}).toArray();

		if (d.length === 0) {
			if (config.beta) Logger.debug("Timed Tasks |  Delete Guilds", "No processable entries found.");
			return;
		}

		await Promise.all(d.map(async (u) => {
			await mdb.collection<GuildConfig>("guilds").findOneAndDelete({ id: u.id });
			Logger.debug("Timed Tasks |  Delete Guild", `Deleted the guild "${u.id}"`);
		}));
	}

	/*static async runAutoServerActions(client: FurryBot) {
		const a = await mdb.collection<TimedEntry>("timed").find({}).toArray();

		await Promise.all(a.map(async (entry) => {
			if (entry.expiry > Date.now()) return;
			switch (entry.type) {
				case "ban": {
					const g = client.guilds.get(entry.guildId);
					if (!g) {
						return mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}
					await g.unbanMember(entry.userId, "Automatic Unban").catch(err => null);
					const u = client.users.has(entry.userId) ? client.users.get(entry.userId) : await client.getRESTUser(entry.userId);
					const c = await db.getGuild(entry.guildId);
					if (!c.settings.modlog) {
						mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}

					const ch = (g.channels.has(c.settings.modlog) ? g.channels.get(c.settings.modlog) : await client.getRESTChannel(c.settings.modlog)) as Eris.GuildTextableChannel;
					if (!ch) {
						await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						Logger.warn("Timed Tasks |  Auto Server Actions", `failed to send mod log entry to "${entry.guildId}" because its mod log channel does not exist.`);
					}

					if (ch && !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(client.user.id).has(p))) {
						await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						Logger.warn("Timed Tasks |  Auto Server Actions", `failed to send mod log entry to "${entry.guildId}" as I do not have permission to send there.`);
					}

					await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					await client.m.createUnbanEntry(ch, "automatic", u, "Automatic action due to expiry");

					break;
				}

				case "mute": {
					const g = client.guilds.get(entry.guildId);
					if (!g) {
						return mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}
					// fetch user from api if they aren't in the server
					const m = g.members.has(entry.userId) ? g.members.get(entry.userId) : await client.getRESTUser(entry.userId);
					const c = await db.getGuild(entry.guildId);
					const r = g.roles.get(c.settings.muteRole);
					if (!c.settings.modlog) {
						await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}

					const ch = (g.channels.has(c.settings.modlog) ? g.channels.get(c.settings.modlog) : await client.getRESTChannel(c.settings.modlog)) as Eris.GuildTextableChannel;
					if (!ch) {
						await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						Logger.warn("Timed Tasks | Auto Server Actions", `failed to send mod log entry to "${entry.guildId}" because its mod log channel does not exist.`);
					}

					if (ch && !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(client.user.id).has(p))) {
						await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						Logger.log("Timed Tasks | Auto Server Actions", `failed to send mod log entry to "${entry.guildId}" as I do not have permission to send there.`);
					}

					if (!g.members.has(entry.userId)) {
						if (ch) await ch.createMessage({
							embed: {
								title: "Automatic Unmute Failed",
								description: `I failed to automatically unmute **${m.username}#${m.discriminator}** (<@!${m.id}>)\nReason: The user is not in the server.`,
								timestamp: new Date().toISOString(),
								color: Colors.red,
								author: {
									name: `${client.user.username}#${client.user.discriminator}`,
									icon_url: client.user.avatarURL
								}
							}
						}).catch(err => null);
						await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}

					if (m instanceof Eris.Member) {
						if (!m.roles.includes(c.settings.muteRole)) {
							await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
							return;
						}

						if (!r) {
							await ch.createMessage({
								embed: {
									title: "Automatic Unmute Failed",
									description: `I failed to automatically unmute **${m.username}#${m.discriminator}** (<@!${m.id}>)\nReason: Couldn't find mute role.`,
									timestamp: new Date().toISOString(),
									color: Colors.red,
									author: {
										name: `${client.bot.user.username}#${client.user.discriminator}`,
										icon_url: client.user.avatarURL
									}
								}
							}).catch(err => null);
							await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
							return;
						}

						await m.removeRole(r.id, "Automatic Unmute").catch(err => null);

						await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						if (ch) await client.m.createUnmuteEntry(ch, "automatic", m, "Automatic action due to expiry.");
					}
					break;
				}

				default: {
					await mdb.collection<TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					Logger.warn("Timed Tasks | Auto Server Actions", `Unknown timed type "${entry.type}" found.`);
				}
			}
		}));
	}*/

	static async runDailyJoins(client: FurryBot) {
		DailyJoins(client);
	}

	static async runRefreshBoosters(client: FurryBot) {
		const g = client.bot.guilds.get(config.client.supportServerId);
		await g.fetchAllMembers();

		await mdb.collection("users").updateMany({
			booster: true
		}, {
			$set: {
				booster: false
			}
		});

		let i = 0;
		for (const [id, member] of g.members) {
			if (member.roles.includes(config.roles.booster)) {
				i++;
				await mdb.collection("users").findOneAndUpdate({
					id
				}, {
					$set: {
						booster: true
					}
				});
			}
		}

		Logger.debug("Timed Tasks | Refresh Boosters", `Got ${i} boosters.`);
	}
}
