import { mdb, db } from "../../modules/Database";
import UserConfig from "../../modules/config/UserConfig";
import config from "../../config";
import Logger from "../LoggerV9";
import FurryBot from "../../main";
import { Colors, GameTypes } from "../Constants";
import GuildConfig from "../../modules/config/GuildConfig";
import Eris from "eris";
import { Request, Internal } from ".";
import EmbedBuilder from "../EmbedBuilder";
import phin from "phin";
import { FurryBotAPI, Redis } from "../../modules/External";
import WebhookStore from "../../modules/Holders/WebhookStore";

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

			if ([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].includes(d.getMinutes())) await this.runAutoPosting(client, d.getMinutes()).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Posting [5]"));
			if ([0, 10, 20, 30, 40, 50].includes(d.getMinutes())) await this.runAutoPosting(client, d.getMinutes()).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Posting [10]"));
			if ([0, 15, 30, 45].includes(d.getMinutes())) await this.runAutoPosting(client, d.getMinutes()).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Posting [15]"));
			if ([0, 30].includes(d.getMinutes())) await this.runAutoPosting(client, d.getMinutes()).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Posting [30]"));
			if ([0].includes(d.getMinutes())) await this.runAutoPosting(client, d.getMinutes()).then(() => client.log("debug", "Finished processing.", "Timed Tasks |  Run Auto Posting [60]"));

			if (!config.beta && d.getHours() === 0 && d.getMinutes() === 0) await this.runDailyJoins(client).then(() => client.log("debug", "Finished processing.", "Timed Tasks | Daily Joins"));
		}

		if ((d.getSeconds() % 15) === 0) {
			await this.runStatusChange(client, (d.getSeconds() / 15) - 1).then(() => config.beta ? client.log("debug", "Finished processing.", "Timed Tasks | Status Change") : null);
			await this.runStatsUpdate(client).then(() => client.log("debug", "Finished Processing.", "Timed Tasks | Stats Update"));
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
			if (config.beta) client.log("warn", "No processable entries found.", "Timed Tasks |  Delete Users");
			return;
		}

		await Promise.all(d.map(async (u) => {
			const s = await client.getRESTUser(u.id);

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
					const g = await client.guilds.get(entry.guildId);
					await g.unbanMember(entry.userId, `Automatic Unban`).catch(err => null);
					const u = client.users.has(entry.userId) ? client.users.get(entry.userId) : await client.getRESTUser(entry.userId);
					const c = await db.getGuild(entry.guildId);
					if (!c.settings.modlog) {
						mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}

					const ch = g.channels.has(c.settings.modlog) ? g.channels.get<Eris.GuildTextableChannel>(c.settings.modlog) : await client.getRESTChannel<Eris.GuildTextableChannel>(c.settings.modlog);
					if (!ch) {
						await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						client.log("warn", `failed to send mod log entry to "${entry.guildId}" because its mod log channel does not exist.`, "Timed Tasks |  Auto Server Actions");
					}

					if (!!ch && !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(client.user.id).has(p))) {
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
					const g = await client.guilds.get(entry.guildId);
					// fetch user from api if they aren't in the server
					const m = g.members.has(entry.userId) ? g.members.get(entry.userId) : await client.getRESTUser(entry.userId);
					const c = await db.getGuild(entry.guildId);
					const r = g.roles.get(c.settings.muteRole);
					if (!c.settings.modlog) {
						await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
					}

					const ch = g.channels.has(c.settings.modlog) ? g.channels.get<Eris.GuildTextableChannel>(c.settings.modlog) : await client.getRESTChannel<Eris.GuildTextableChannel>(c.settings.modlog);
					if (!ch) {
						await mdb.collection<GlobalTypes.TimedEntry>("timed").findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						client.log("warn", `failed to send mod log entry to "${entry.guildId}" because its mod log channel does not exist.`, "Timed Tasks | Auto Server Actions");
					}

					if (!!ch && !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(client.user.id).has(p))) {
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
									name: `${client.user.username}#${client.user.discriminator}`,
									icon_url: client.user.avatarURL
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
										name: `${client.user.username}#${client.user.discriminator}`,
										icon_url: client.user.avatarURL
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
		if (time === 0) time = 60;
		const entries = await mdb.collection<GlobalTypes.AutoEntry>("auto").find({ time: time as any }).toArray();

		await Promise.all(entries.map(async (entry) => {
			const g = await db.getGuild(entry.guildId);
			if (!g) {
				client.log("warn", `Skipped posting type "${entry.type}" in guild "${g.id}" because the guild entry does not exist in the database.`, "Timed Tasks | Auto Posting");
				await mdb.collection("auto").findOneAndDelete({ _id: entry._id });
				return;
			}

			if (!client.guilds.has(g.id)) {
				client.log("warn", `Skipped posting type "${entry.type}" in guild "${g.id}" because the guild has been removed.`, "Timed Tasks | Auto Posting");
				await mdb.collection("auto").findOneAndDelete({ _id: entry._id });
				return;
			}

			const p = await g.premiumCheck();
			if (!p.active) {
				client.log("warn", `Skipped posting type "${entry.type}" in guild "${g.id}" because their premium is not active.`, "Timed Tasks | Auto Posting");
				await mdb.collection("auto").findOneAndDelete({ _id: entry._id });
				return;
			}

			const embed = new EmbedBuilder("en")
				.setAuthor("Auto Posting", config.images.botIcon)
				.setColor(Colors.green)
				.setTimestamp(new Date().toISOString())
				.setImage("attachment://image.png");

			let file: Buffer;

			switch (entry.type) {
				case "animals.bird": {
					file = await FurryBotAPI.animals.birb("json").then(async (r) => Request.getImageFromURL(r[0].url));
					break;
				}

				case "animals.bunny": {
					file = await Request.chewyBotAPIRequest("bunny").then(i => Request.getImageFromURL(i));
					break;
				}

				case "animals.cat": {
					file = await phin<{ file: string; }>({
						method: "GET",
						url: "https://aws.random.cat/meow",
						parse: "json",
						headers: {
							"User-Agent": config.web.userAgent
						}
					}).then(i => Request.getImageFromURL(i.body.file));
					break;
				}

				case "animals.duck": {
					file = await Request.chewyBotAPIRequest("duck").then(i => Request.getImageFromURL(i));
					break;
				}

				case "animals.fox": {
					file = await Request.getImageFromURL("https://foxrudor.de");
					break;
				}

				case "animals.otter": {
					file = await Request.chewyBotAPIRequest("otter").then(i => Request.getImageFromURL(i));
					break;
				}

				case "animals.panda": {
					file = await Request.chewyBotAPIRequest("panda").then(i => Request.getImageFromURL(i));
					break;
				}

				case "animals.snek": {
					file = await Request.chewyBotAPIRequest("snek").then(i => Request.getImageFromURL(i));
					break;
				}

				case "animals.turtle": {
					file = await Request.chewyBotAPIRequest("turtle").then(i => Request.getImageFromURL(i));
					break;
				}

				case "animals.wolf": {
					file = await Request.chewyBotAPIRequest("wolf").then(i => Request.getImageFromURL(i));
					break;
				}

				case "yiff.dickgirl": {
					await FurryBotAPI.furry.yiff.dickgirl("json", 1).then(async (r) => Request.getImageFromURL(r[0].url));
					break;
				}

				case "yiff.gay": {
					await FurryBotAPI.furry.yiff.gay("json", 1).then(async (r) => Request.getImageFromURL(r[0].url));
					break;
				}

				case "yiff.lesbian": {
					await FurryBotAPI.furry.yiff.lesbian("json", 1).then(async (r) => Request.getImageFromURL(r[0].url));
					break;
				}

				case "yiff.straight": {
					await FurryBotAPI.furry.yiff.straight("json", 1).then(async (r) => Request.getImageFromURL(r[0].url));
					break;
				}
			}

			await client.executeWebhook(entry.webhook.id, entry.webhook.token, {
				embeds: [
					embed.toJSON()
				],
				file: {
					name: "image.png",
					file
				}
			});
		}));
	}

	static async runDailyJoins(client: FurryBot) {
		const d = new Date((Date.now() - 432e5) - 8.64e+7);
		const id = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
		let k = await mdb.collection("dailyjoins").findOne({ id }).then(r => r.guildCount).catch(err => null);
		if (!k) k = "Unknown.";
		else k = (client.guilds.size - k).toString();
		client.log("log", `Daily joins for ${id}: ${k}`, "Daily Joins");
		await client.w.get("directMessage").execute({
			embeds: [
				{
					title: `Daily Joins for ${id}`,
					description: `Total Servers Joined Today: ${k}\nTotal Servers: ${client.guilds.size}`,
					timestamp: new Date().toISOString()
				}
			],
			username: `Daily Joins${config.beta ? " - Beta" : ""}`,
			avatarURL: config.images.botIcon
		});
	}

	static async runStatusChange(client: FurryBot, num: number) {
		switch (num) {
			case 0: {
				await client.editStatus("online", { name: `${config.defaults.prefix}help with ${client.users.size} furries`, type: GameTypes.PLAYING });
				break;
			}

			case 1: {
				await client.editStatus("online", { name: `${config.defaults.prefix}help in ${client.guilds.size} servers`, type: GameTypes.WATCHING });
				break;
			}

			case 2: {
				await client.editStatus("online", { name: `${config.defaults.prefix}help in ${Object.keys(client.channelGuildMap).length} channels`, type: GameTypes.LISTENING });
				break;
			}

			case 3: {
				await client.editStatus("online", { name: `${config.defaults.prefix}help at https://furry.bot`, type: GameTypes.PLAYING });
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
