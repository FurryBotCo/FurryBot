import { mdb, db } from "../../modules/Database";
import UserConfig from "../../modules/config/UserConfig";
import config from "../../config";
import FurryBot from "../../main";
import { Colors, GameTypes } from "../Constants";
import GuildConfig from "../../modules/config/GuildConfig";
import Eris from "eris";
import { Internal } from ".";
import { Redis } from "../../modules/External";

export default class TimedTasks {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	static async runAll(client: FurryBot) {
		const d = new Date();
		if (d.getSeconds() === 0) {
			if (d.getMinutes() === 0) {
				await this.runDeleteUsers(client).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Delete Users"));
				await this.runDeleteGuilds(client).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Delete Guilds"));
			}

			for (const n of [5, 10, 15, 30]) {
				if ((d.getMinutes() % n) === 0) await this.runAutoPosting(client, n).then(() => client.log("debug", "Finished processing.", `Timed Tasks |  Run Auto Posting [${n}]`));
			}
			// if ([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].includes(d.getMinutes())) await this.runAutoPosting(client, d.getMinutes()).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Posting [5]"));
			// if ([0, 10, 20, 30, 40, 50].includes(d.getMinutes())) await this.runAutoPosting(client, d.getMinutes()).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Posting [10]"));
			// if ([0, 15, 30, 45].includes(d.getMinutes())) await this.runAutoPosting(client, d.getMinutes()).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Posting [15]"));
			// if ([0, 30].includes(d.getMinutes())) await this.runAutoPosting(client, d.getMinutes()).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Posting [30]"));
			// if ([0].includes(d.getMinutes())) await this.runAutoPosting(client, d.getMinutes()).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Posting [60]"));

			if (!config.beta && d.getHours() === 0 && d.getMinutes() === 0) await this.runDailyJoins(client).then(() => client.log("debug", "Finished processing.", "Timed Tasks | Daily Joins"));
		}

		if ((d.getSeconds() % 15) === 0) {
			await this.runStatusChange(client, (d.getSeconds() / 15) - 1); // .then(() => config.beta ? client.log("debug", "Finished processing.", "Timed Tasks | Status Change") : null);
			await this.runStatsUpdate(client); // .then(() => client.log("debug", "Finished Processing.", "Timed Tasks | Stats Update"));
		}

		await this.runAutoServerActions(client); // .then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Actions"));
	}


	static async runDeleteUsers(client: FurryBot) {
		const d = await mdb.collection<UserConfig>("users").find({
			$and: [
				{ deletion: { $ne: 0 } },
				{ deletion: { $ne: null } }
			]
		}).toArray();

		if (d.length === 0) {
			if (config.beta) client.log("debug", "No processable entries found.", "Timed Tasks |  Delete Users");
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
			client.log("debug", `Deleted the user "${u.id}"`, "Timed Tasks |  Delete Users");
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
			if (config.beta) client.log("warn", "No processable entries found.", "Timed Tasks |  Delete Guilds");
			return;
		}

		await Promise.all(d.map(async (u) => {
			await mdb.collection<GuildConfig>("guilds").findOneAndDelete({ id: u.id });
			client.log("debug", `Deleted the guild "${u.id}"`, "Timed Tasks |  Delete Guild");
		}));
	}

	static async runAutoServerActions(client: FurryBot) {
		const a = await mdb.collection<GlobalTypes.TimedEntry>("timed").find({}).toArray();

		await Promise.all(a.map(async (entry) => {
			if (entry.expiry > Date.now()) return;
			switch (entry.type) {
				case "ban": {
					const g = client.bot.guilds.has(entry.guildId) ? client.bot.guilds.get(entry.guildId) : await client.bot.getRESTGuild(entry.guildId);
					if (!g) {
						return mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}
					await g.unbanMember(entry.userId, `Automatic Unban`).catch(err => null);
					const u = client.bot.users.has(entry.userId) ? client.bot.users.get(entry.userId) : await client.bot.getRESTUser(entry.userId);
					const c = await db.getGuild(entry.guildId);
					if (!c.settings.modlog) {
						mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}

					const ch = (g.channels.has(c.settings.modlog) ? g.channels.get(c.settings.modlog) : await client.bot.getRESTChannel(c.settings.modlog)) as Eris.GuildTextableChannel;
					if (!ch) {
						await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						client.log("warn", `failed to send mod log entry to "${entry.guildId}" because its mod log channel does not exist.`, "Timed Tasks |  Auto Server Actions");
					}

					if (!!ch && !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(client.bot.user.id).has(p))) {
						await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						client.log("warn", `failed to send mod log entry to "${entry.guildId}" as I do not have permission to send there.`, "Timed Tasks |  Auto Server Actions");
					}

					await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					await client.m.create(ch, {
						type: "unban",
						blame: "automatic",
						target: u,
						reason: "Automatic action due to expiry"
					});

					break;
				}

				case "mute": {
					const g = client.bot.guilds.has(entry.guildId) ? client.bot.guilds.get(entry.guildId) : await client.bot.getRESTGuild(entry.guildId);
					if (!g) {
						return mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}
					// fetch user from api if they aren't in the server
					const m = g.members.has(entry.userId) ? g.members.get(entry.userId) : await client.bot.getRESTUser(entry.userId);
					const c = await db.getGuild(entry.guildId);
					const r = g.roles.get(c.settings.muteRole);
					if (!c.settings.modlog) {
						await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}

					const ch = (g.channels.has(c.settings.modlog) ? g.channels.get(c.settings.modlog) : await client.bot.getRESTChannel(c.settings.modlog)) as Eris.GuildTextableChannel;
					if (!ch) {
						await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						client.log("warn", `failed to send mod log entry to "${entry.guildId}" because its mod log channel does not exist.`, "Timed Tasks | Auto Server Actions");
					}

					if (!!ch && !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(client.bot.user.id).has(p))) {
						await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						client.log("warn", `failed to send mod log entry to "${entry.guildId}" as I do not have permission to send there.`, "Timed Tasks | Auto Server Actions");
					}

					if (!g.members.has(entry.userId)) {
						if (!!ch) await ch.createMessage({
							embed: {
								title: "Automatic Unmute Failed",
								description: `I failed to automatically unmute **${m.username}#${m.discriminator}** (<@!${m.id}>)\nReason: The user is not in the server.`,
								timestamp: new Date().toISOString(),
								color: Colors.red,
								author: {
									name: `${client.bot.user.username}#${client.bot.user.discriminator}`,
									icon_url: client.bot.user.avatarURL
								}
							}
						}).catch(err => null);
						await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}

					if (m instanceof Eris.Member) {
						if (!m.roles.includes(c.settings.muteRole)) {
							await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
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
										name: `${client.bot.user.username}#${client.bot.user.discriminator}`,
										icon_url: client.bot.user.avatarURL
									}
								}
							}).catch(err => null);
							await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
							return;
						}

						await m.removeRole(r.id, "Automatic Unmute").catch(err => null);

						await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						if (!!ch) await client.m.create(ch, {
							type: "unmute",
							blame: "automatic",
							target: m,
							reason: "Automatic action due to expiry."
						});
					}
					break;
				}

				default: {
					await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					client.log("warn", `Unknown timed type "${entry.type}" found.`, "Timed Tasks | Auto Server Actions");
				}
			}
		}));
	}

	static async runAutoPosting(client: FurryBot, time: number) {
		if (client.clusterID !== 0) return;
		if (time === 0) time = 60;
		const entries = await mdb.collection<GlobalTypes.AutoEntry>("auto").find({ time: time as any }).toArray();

		await Promise.all(entries.map(async (entry) => client.ipc.command("AutoPosting", entry, false)));
	}

	static async runDailyJoins(client: FurryBot) {
		if (client.clusterID !== 0) return;
		const st = await client.ipc.getStats();
		// @TODO fix daily joins
		const d = new Date((Date.now() - 6e4));
		const id = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
		let k: string | number = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:stats:dailyJoins:${id}`).then(v => !v ? 0 : Number(v));
		if (!k) k = "Unknown.";
		else k = (st.clusters.reduce((a, b) => b.guilds + a, 0) - Number(k)).toString();
		client.log("log", `Daily joins for ${id}: ${k}`, "Daily Joins");
		await client.w.get("dailyjoins").execute({
			embeds: [
				{
					title: `Daily Joins for ${id}`,
					description: `Total Servers Joined Today: ${k}\nTotal Servers: ${st.clusters.reduce((a, b) => b.guilds + a, 0)}`,
					timestamp: new Date().toISOString()
				}
			],
			username: `Daily Joins${config.beta ? " - Beta" : ""}`,
			avatarURL: config.images.botIcon
		});
	}

	static async runStatusChange(client: FurryBot, num: number) {
		const st = await client.ipc.getStats();
		switch (num) {
			case 0: {
				await client.bot.editStatus("online", { name: `${config.defaults.prefix}help with ${st.clusters.reduce((a, b) => b.users + a, 0)} furries`, type: GameTypes.PLAYING });
				break;
			}

			case 1: {
				await client.bot.editStatus("online", { name: `${config.defaults.prefix}help in ${st.clusters.reduce((a, b) => b.guilds + a, 0)} servers`, type: GameTypes.WATCHING });
				break;
			}

			case 2: {
				await client.bot.editStatus("online", { name: `${config.defaults.prefix}help with ${client.cmd.commands.length} commands`, type: GameTypes.PLAYING });
				break;
			}

			case 3: {
				await client.bot.editStatus("online", { name: `${config.defaults.prefix}help at https://furry.bot`, type: GameTypes.PLAYING });
				break;
			}
		}
	}

	static async runStatsUpdate(client: FurryBot) {
		// rClient.SET(`${config.beta ? "beta" : "prod"}:stats:guildCount`, client.guilds.size.toString());
		// rClient.SET(`${config.beta ? "beta" : "prod"}:stats:largeGuildCount`, client.guilds.filter(g => g.large).length.toString());
		// rClient.SET(`${config.beta ? "beta" : "prod"}:stats:channelCount`, Object.keys(client.channelGuildMap).length.toString());
		// rClient.SET(`${config.beta ? "beta" : "prod"}:stats:userCount`, client.users.size.toString());
		const v = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:stats:uptime`).then(v => !v ? 0 : Number(v));
		const up = Math.floor(process.uptime() * 1000);
		if (up > v) await Redis.SET(`${config.beta ? "beta" : "prod"}:stats:uptime`, up.toString());
	}
}
