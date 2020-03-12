import config from "../../config";
import { mdb, db } from "../../modules/Database";
import { Blacklist } from "../@types/Misc";
import * as os from "os";
import FurryBot from "@FurryBot";
import loopPatrons from "../patreon/loopPatrons";
import refreshPatreonToken from "../patreon/refreshPatreonToken";
import GuildConfig from "../../modules/config/GuildConfig";
import Eris from "eris";
import { Request, Utility, Time, Strings } from ".";
import Logger from "../LoggerV8";
import { Colors } from "../Constants";

export default class Internal {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	static async fetchBlacklistEntries(id: string, type: "guild"): Promise<{
		current: Blacklist.GuildEntry[];
		past: Blacklist.GuildEntry[];
		active: boolean;
	}>;
	static async fetchBlacklistEntries(id: string, type: "user"): Promise<{
		current: Blacklist.UserEntry[];
		past: Blacklist.UserEntry[];
		active: boolean;
	}>;
	/**
	 * fetches blacklist entries for users/guilds
	 * @static
	 * @param {string} id - the user or guild id
	 * @param {("guild" | "user")} type - the type, user or guild
	 * @returns {Promise<any>}
	 * @memberof Internal
	 */
	static async fetchBlacklistEntries(id: string, type: "guild" | "user") {
		if (!["guild", "user"].includes(type.toLowerCase())) throw new TypeError("Invalid type.");

		if (type.toLowerCase() === "guild") {
			const b: Blacklist.GuildEntry[] = await mdb.collection("blacklist").find({ guildId: id }).toArray();

			if (b.length === 0) return {
				current: [],
				past: [],
				active: false
			};
		} else {
			const b: Blacklist.UserEntry[] = await mdb.collection("blacklist").find({ userId: id }).toArray();

			if (b.length === 0) return {
				current: [],
				past: [],
				active: false
			};
		}
	}
	/**
	 * memory info
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get memory() {
		return {
			process: {
				/**
				 * process total memory
				 * @returns {number}
				 */
				getTotal: (() => process.memoryUsage().heapTotal),
				/**
				 * process used memory
				 * @returns {number}
				 */
				getUsed: (() => process.memoryUsage().heapUsed),
				/**
				 * process rss memory
				 * @returns {number}
				 */
				getRSS: (() => process.memoryUsage().rss),
				/**
				 * process external memory
				 * @returns {number}
				 */
				getExternal: (() => process.memoryUsage().external),
				/**
				 * process memory usage
				 * @returns {T.ProcessMemory}
				 */
				getAll: (() => ({
					total: process.memoryUsage().heapTotal,
					used: process.memoryUsage().heapUsed,
					rss: process.memoryUsage().rss,
					external: process.memoryUsage().external
				}))
			},
			system: {
				/**
				 * system total memory
				 * @returns {number}
				 */
				getTotal: (() => os.totalmem()),
				/**
				 * system used memory
				 * @returns {number}
				 */
				getUsed: (() => os.totalmem() - os.freemem()),
				/**
				 * system free memory
				 * @returns {number}
				 */
				getFree: (() => os.freemem()),
				/**
				 * system memory usage
				 * @returns {T.SystemMemory}
				 */
				getAll: (() => ({
					total: os.totalmem(),
					used: os.totalmem() - os.freemem(),
					free: os.freemem()
				}))
			}
		};
	}

	/**
	 *
	 * @static
	 * @param {any[]} reports
	 * @returns {any}
	 * @memberof Internal
	 */
	static combineReports(...reports: {
		userTag: string;
		userId: string;
		generatedTimestamp: number;
		type: "cmd" | "response";
		beta: boolean;
		entries: {
			time: number;
			cmd: string;
		}[] | {
			time: number;
			response: string;
		}[];
	}[]): {
		userTag: string;
		userId: string;
		generatedTimestamp: number;
		type: "cmd" | "response";
		beta: boolean;
		entries: {
			time: number;
			cmd: string;
		}[] | {
			time: number;
			response: string;
		}[];
	} {
		if (Array.from(new Set(reports.map(r => r.userId))).length > 1) throw new TypeError("Cannot combine reports of different users.");
		if (Array.from(new Set(reports.map(r => r.type))).length > 1) throw new TypeError("Cannot combine reports of different types.");
		if (Array.from(new Set(reports.map(r => r.beta))).length > 1) throw new TypeError("Cannot combine beta, and non-beta reports.");

		const entries: any = Array.from(new Set(reports.map(r => r.entries as any).reduce((a, b) => a.concat(b)).map(r => JSON.stringify(r)))).map(r => JSON.parse(r as string));
		return {
			userTag: reports[0].userTag,
			userId: reports[0].userId,
			generatedTimestamp: Date.now(),
			type: reports[0].type,
			beta: reports[0].beta,
			entries
		};
	}

	/**
	 * Increment or decrement the daily guild join counter
	 * @static
	 * @param {boolean} [increment=true]
	 * @returns {Promise<number>}
	 * @memberof Internal
	 */
	static async incrementDailyCounter(client: FurryBot, increment = true): Promise<number> {
		const d = new Date();
		const id = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;

		const j = await mdb.collection("dailyjoins").findOne({ id });
		const count = j ? increment ? j.count + 1 : j.count - 1 : increment ? 1 : -1;
		await mdb.collection("dailyjoins").findOneAndDelete({ id });
		await mdb.collection("dailyjoins").insertOne({ count, id, guildCount: client.guilds.size });

		return count;
	}

	/**
	 * get a user from the database
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getUser(): typeof db["getUser"] { return db.getUser.bind(db); }
	/**
	 * get a user from the database (synchronous)
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getUserSync(): typeof db["getUserSync"] { return db.getUserSync.bind(db); }
	/**
	 * get a guild from the database
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getGuild(): typeof db["getGuild"] { return db.getGuild.bind(db); }
	/**
	 * get a guild from the database (synchronous)
	 * @readonly
	 * @static
	 * @memberof Internal
	 */
	static get getGuildSync(): typeof db["getGuildSync"] { return db.getGuildSync.bind(db); }

	static get loopPatrons() { return loopPatrons; }
	static get refreshPatreonToken() { return refreshPatreonToken; }

	/**
	 * Run auto content systems
	 * @static
	 * @param {number} time
	 * @param {FurryBot} client
	 * @memberof Internal
	 */
	static async runAuto(time: number, client: FurryBot) {
		// @TODO clean this crap up
		const guilds = await mdb
			.collection("guilds")
			.find<GuildConfig>({})
			.toArray()
			.then(g =>
				g.filter(k => k.auto && k.auto.length > 0)
			);

		const counter = {
			gay: 0,
			straight: 0,
			lesbian: 0,
			dickgirl: 0
		};
		for (const g of guilds) for (const w of g.auto.filter(a => a.time === (time / 6e4))) {
			switch (w.type.toLowerCase() as typeof w.type) {
				case "yiff": {
					const img = await Request.imageAPIRequest(false, `yiff/${w.cat}`, true, false);
					const embed: Eris.EmbedOptions = {
						title: "Auto Yiff",
						color: Math.floor(Math.random() * 0xFFFFFF),
						timestamp: new Date().toISOString(),
						footer: {
							text: `Disable this using "${g.settings.prefix}auto yiff disable ${w.cat}" (without quotes)`
						}
					};
					if (img.success !== true) embed.description = `API Error encountered while fetching image.\nCode: ${img.error.code} \nDescription: \`${img.error.description}\`\nReport this to my [support server](${config.bot.supportInvite})`;
					else {
						const short = await Utility.shortenURL(img.response.image);
						embed.description = `Type: ${w.cat}\nShort URL: ${short.link}`;
						embed.image = {
							url: img.response.image
						};
					}

					await client.executeWebhook(w.webhook.id, w.webhook.token, {
						embeds: [
							embed
						]
					}).then(() => counter[w.cat]++);
					break;
				}

				default:
					Logger.error("Auto", `unknown type "${w.type.toLowerCase()}"`);
			}
		}

		Logger.debug("Auto", `${time / 6e4}m Processed\nTotal Ran:\n${Object.keys(counter).map(k => `${Strings.ucwords(k)}: ${counter[k]}`).join("\n")}`);
	}


	static async timedCheck(client: FurryBot) {
		const col = mdb.collection<GlobalTypes.TimedEntry>("timed");
		const e = await col.find({}).toArray();

		for (const entry of e) {
			if (!client.guilds.has(entry.guildId)) {
				await col.findOneAndDelete({ _id: entry._id });
				Logger.warn("Timed Check", `skipped timed ${entry.type} for user "${entry.userId}" because the guild "${entry.guildId}" is no longer present.`);
				continue;
			}

			if (Date.now() < entry.expiry) continue;

			switch (entry.type) {
				case "ban": {
					const g = client.guilds.get(entry.guildId);
					await g.unbanMember(entry.userId, `Automatic Unban`).catch(err => null);
					const u = client.users.has(entry.userId) ? client.users.get(entry.userId) : await client.getRESTUser(entry.userId);
					const c = await db.getGuild(entry.guildId);
					if (!c.settings.modlog) {
						await col.findOneAndDelete({ _id: entry._id });
						continue;
					}
					const ch = g.channels.get<Eris.GuildTextableChannel>(c.settings.modlog);
					if (!ch) {
						await col.findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						Logger.warn("Timed Check", `failed to send mod log entry to "${entry.guildId}" because its mod log channel does not exist.`);
						continue;
					}

					if (!["sendMessages", "embedLinks"].some(p => ch.permissionsOf(client.user.id).has(p))) {
						await col.findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						Logger.warn("Timed Check", `failed to send mod log entry to "${entry.guildId}" as I do not have permission to send there.`);
						continue;
					}

					await ch.createMessage({
						embed: {
							title: "Member Unbanned",
							description: [
								`Target: ${u.username}#${u.discriminator} <@!${u.id}>`,
								`Reason: Automatic action due to expiry.`
							].join("\n"),
							timestamp: new Date().toISOString(),
							color: Colors.green,
							author: {
								name: `${client.user.username}#${client.user.discriminator}`,
								icon_url: client.user.avatarURL
							},
							footer: {
								text: `Action was automatically performed.`
							}
						}
					});
					await col.findOneAndDelete({ _id: entry._id });
					break;
				}

				case "mute": {
					const g = client.guilds.get(entry.guildId);
					// fetch user from api if they aren't in the server
					const m = g.members.has(entry.userId) ? g.members.get(entry.userId) : await client.getRESTUser(entry.userId);
					const c = await db.getGuild(entry.guildId);
					const r = g.roles.get(c.settings.muteRole);
					if (!c.settings.modlog) {
						await col.findOneAndDelete({ _id: entry._id });
						continue;
					}

					const ch = g.channels.get<Eris.GuildTextableChannel>(c.settings.modlog);
					if (!ch) {
						await col.findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						Logger.warn("Timed Check", `failed to send mod log entry to "${entry.guildId}" because its mod log channel does not exist.`);
						continue;
					}

					if (!["sendMessages", "embedLinks"].some(p => ch.permissionsOf(client.user.id).has(p))) {
						await col.findOneAndDelete({ _id: entry._id });
						await c.edit({ settings: { modlog: null } });
						Logger.warn("Timed Check", `failed to send mod log entry to "${entry.guildId}" as I do not have permission to send there.`);
						continue;
					}

					if (!g.members.has(entry.userId)) {
						await ch.createMessage({
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
						});
						await col.findOneAndDelete({ _id: entry._id });
						continue;
					}

					if (m instanceof Eris.Member) {
						if (!m.roles.includes(c.settings.muteRole)) {
							await col.findOneAndDelete({ _id: entry._id });
							continue;
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
							});
							await col.findOneAndDelete({ _id: entry._id });
							continue;
						}

						await m.removeRole(r.id, "Automatic Unmute").catch(err => null);

						await ch.createMessage({
							embed: {
								title: "Member Unmuted",
								description: [
									`Target: ${m.username}#${m.discriminator} <@!${m.id}>`,
									`Reason: Automatic action due to expiry.`
								].join("\n"),
								timestamp: new Date().toISOString(),
								color: Colors.green,
								author: {
									name: `${client.user.username}#${client.user.discriminator}`,
									icon_url: client.user.avatarURL
								},
								footer: {
									text: `Action was automatically performed.`
								}
							}
						});
						await col.findOneAndDelete({ _id: entry._id });
					}
					break;
				}

				default: {
					await col.findOneAndDelete({ _id: entry._id });
					Logger.warn("Timed Check", `Unknown timed type "${entry.type}" found.`);
				}
			}
		}
	}

	static sanitize(str: string) {
		console.log(str);
		if (typeof str !== "string") str = (str as any).toString();
		["*", "_", "@"].map(s => str = str.replace(new RegExp(`\\${s}`, "gi"), `\\${s}`));
		return str;
	}

	static formatWelcome(str: string, user: Eris.User, guild: Eris.Guild) {
		const d = new Date(user.createdAt);
		const f = {
			"user.username": user.username,
			"user.discriminator": user.discriminator,
			"user.tag": `${user.username}#${user.discriminator}`,
			"user.id": user.id,
			"user.mention": `<@!${user.id}>`,
			"user.creationAgo": Time.formatAgo(d),
			"user.creationUS": `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear}`,
			"user.creationUK": `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear}`,
			"user.creationISO": `${d.getFullYear}-${d.getMonth() + 1}-${d.getDate()}`,
			"server.name": guild.name,
			"server.id": guild.id
		};

		Object.keys(f).map(k => str = str.replace(new RegExp(`\\{${k}\\}`, "g"), f[k]));

		return str;
	}
}
