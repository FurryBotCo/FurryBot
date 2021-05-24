import GuildConfig, { DBKeys } from "../db/Models/GuildConfig";
import config from "../config";
import { ModLogEntry, TimedEntry } from "../util/@types/Database";
import { db } from "../db";
import ModLogServiceTypes, { Blame } from "../util/@types/ModLogServiceTypes";
import Language from "language";
import Eris from "eris";
import { Colors, EmbedBuilder, Webhook } from "core";
import { Time } from "utilities";
import Logger from "logger";
import { ObjectId } from "mongodb";
import { BaseService, ServiceInitalizer } from "clustering";


class CustomError extends Error {
	constructor(name: string, message: string) {
		super(message);
		this.name = name;
	}
}


export default class ModerationService extends BaseService {
	private client = new Eris.Client(`Bot ${config.client.token}`, { restMode: true }).on("debug", (m) => Logger.debug("Moderation Service", m));
	private timed: NodeJS.Timeout | null = null;
	private tag: string;
	constructor(setup: ServiceInitalizer) {
		super(setup);
		this.timed = setInterval(this.processTimedEntries.bind(this), 1e3);
		void (this.client.getRESTUser(config.client.id).then(v => v.tag).catch(() => "Unknown#0000")).then(v => this.tag = v);
		this.done();
	}

	async handleCommand(data: ModLogServiceTypes.Commands.AnyCommand) {
		if (data.type === "timedAction") {
			const v = await this.addTimedEntry(data.subType, data.time, data.expiry, data.user, data.guild, data.reason);
			if (v !== true) Logger.error("Moderation Service", "Failed to create timed entry (returned false)", data);
			return v;
		}
		const ch = await this.client.getRESTChannel(data.channel).catch(() => null) as Eris.GuildTextableChannel;
		if (ch === null) {
			Logger.error("Moderation Service", "Failed to execute moderation command (invalid channel)", data);
			return false;
		}

		const gConfig = await db.getGuild(ch.guild.id);
		if (gConfig === null) {
			Logger.error("Moderation Service", "Failed to execute moderation command (failed to get gConfig)", data);
			return false;
		}

		switch (data.type) {
			case "lock": {
				const target = await this.client.getRESTChannel(data.target) as Eris.GuildTextableChannel;
				await this.createLockEntry(ch, gConfig, data.blame, target, data.reason);
				break;
			}

			case "unlock": {
				const target = await this.client.getRESTChannel(data.target) as Eris.GuildTextableChannel;
				await this.createUnlockEntry(ch, gConfig, data.blame, target, data.reason);
				break;
			}

			case "lockdown": {
				await this.createLockdownEntry(ch, gConfig, data.blame, data.reason);
				break;
			}

			case "unlockdown": {
				await this.createUnlockdownEntry(ch, gConfig, data.blame, data.reason);
				break;
			}

			case "warning": {
				const target = await this.client.getRESTUser(data.target);
				await this.createWarnEntry(ch, gConfig, data.blame, target, data.id, data.reason);
				break;
			}

			case "clearWarnings": {
				const target = await this.client.getRESTUser(data.target);
				await this.createClearWarningsEntry(ch, gConfig, data.blame, target, data.total, data.reason);
				break;
			}

			case "deleteWarning": {
				const target = await this.client.getRESTUser(data.target);
				await this.createDeleteWarningEntry(ch, gConfig, data.blame, target, data.oldBlame, data.id, data.reason);
				break;
			}

			case "kick": {
				const target = await this.client.getRESTUser(data.target);
				await this.createKickEntry(ch, gConfig, data.blame, target, data.reason);
				break;
			}

			case "unban": {
				const target = await this.client.getRESTUser(data.target);
				await this.createUnbanEntry(ch, gConfig, data.blame, target, data.reason);
				break;
			}

			case "unmute": {
				const target = await this.client.getRESTUser(data.target);
				await this.createUnmuteEntry(ch, gConfig, data.blame, target, data.reason);
				break;
			}

			case "softban": {
				const target = await this.client.getRESTUser(data.target);
				await this.createSoftBanEntry(ch, gConfig, data.blame, target, data.deleteDays, data.reason);
				break;
			}

			case "ban": {
				const target = await this.client.getRESTUser(data.target);
				await this.createBanEntry(ch, gConfig, data.blame, target, data.expiry, data.deleteDays, data.reason);
				break;
			}

			case "mute": {
				const target = await this.client.getRESTUser(data.target);
				await this.createMuteEntry(ch, gConfig, data.blame, target, data.expiry, data.reason);
				break;
			}

			default: {
				Logger.error("Moderation Service", `Unknown modlog entry type "${(data as { type: string; }).type}" recieved.`);
				return false;
			}
		}
		return true;
	}

	shutdown(done: () => void) {
		if (this.timed !== null) clearInterval(this.timed);
		done();
	}

	/* eslint-disable deprecation/deprecation */
	async addTimedEntry(type: "ban" | "mute", time: number, expiry: number, user: string, guild: string, reason: string | null) {
		const res = await db.collection<TimedEntry>("timed").insertOne({
			type,
			time,
			expiry,
			user,
			guild,
			reason
		});

		return res.result.ok === 1;
	}

	async deleteTimedEntry(e: ObjectId | TimedEntry) {
		return db.collection<TimedEntry>("timed").findOneAndDelete({
			_id: e instanceof ObjectId ? e : e._id
		}).then(v => v.ok === 1);
	}

	async processTimedEntries() {
		const entries = await db.collection<TimedEntry>("timed").find({}).toArray();
		for (const entry of entries) {
			if (entry.expiry > Date.now()) continue;
			// guildId & userId is legacy
			if (entry.guildId) entry.guild = entry.guildId;
			if (entry.userId) entry.user = entry.userId;
			const g = await this.client.getRESTGuild(entry.guild).catch(() => null);
			if (g === null) {
				Logger.warn("Moderation Service", `Removed timed entry ${entry._id!.toHexString()} due to the guild associated with it being absent.`);
				void this.deleteTimedEntry(entry);
				continue;
			}
			void this.deleteTimedEntry(entry);
			void (entry.type === "ban" ? this.handleTimedBanEntry(entry, g) : this.handleTimedMuteEntry(entry, g));
		}
	}

	async handleTimedBanEntry(entry: TimedEntry, g: Eris.Guild) {
		if (!entry.expiry) return false;

		const user = await this.client.getRESTUser(entry.user).catch(() => null);
		if (user === null) return false;
		await g.unbanMember(user.id, "Automatic Unban").catch(() => null);

		const s = await db.getGuild(g.id);

		let ch: Eris.GuildTextableChannel | null = null;

		if (s.modlog.enabled && s.modlog.webhook) ch = await this.client.getRESTChannel(s.modlog.webhook.channelId).catch(() => null) as Eris.GuildTextableChannel | null;

		if (ch !== null) await this.createUnbanEntry(ch, s, "automatic", user, Language.get(s.settings.lang, "other.modlog.autoExpiry"));

		return true;
	}

	async handleTimedMuteEntry(entry: TimedEntry, g: Eris.Guild) {
		if (!entry.expiry) return false;

		const member = await g.getRESTMember(entry.user).catch(() => null);

		if (member === null) return false;

		const s = await db.getGuild(g.id);
		let ch: Eris.GuildTextableChannel | null = null;
		if (!member.roles.includes(s.settings.muteRole)) return false;
		if (!g.roles.has(s.settings.muteRole)) {
			await s.mongoEdit<DBKeys>({
				$set: {
					"settings.muteRole": null
				}
			});
			return false;
		}

		const rm = await member.removeRole(s.settings.muteRole, "Automatic Unmute").then(() => true as const).catch(err => err as Error);
		if (member.voiceState.mute) await member.edit({ mute: false }, "Automatic Unmute");

		if (s.modlog.enabled && s.modlog.webhook) {
			ch = await this.client.getRESTChannel(s.modlog.webhook.channelId).catch(() => null) as Eris.GuildTextableChannel | null;
			const { hook } = await this.modLogCheck(s);
			if (hook) {
				if (rm instanceof Error) {
					await hook.execute({
						embeds: [
							new EmbedBuilder(s.settings.lang)
								.setTitle("{lang:other.modlog.autoUnmuteFail.title}")
								.setDescription(`{lang:other.modlog.autoUnmuteFail.description|${member.tag}|${entry.user}|${Language.get(s.settings.lang, "other.modlog.autoUnmuteFail.reasonNotPresent")}`)
								.setTimestamp(new Date().toISOString())
								.setColor(Colors.red)
								.setAuthor(this.tag, config.images.icons.bot)
								.toJSON()
						]
					});
					return false;
				}
			} else await s.mongoEdit({
				$set: {
					"modlog.enabled": false,
					"modlog.webhook": null
				}
			});
		}

		if (ch !== null) await this.createUnmuteEntry(ch, s, "automatic", member, Language.get(s.settings.lang, "other.modlog.autoExpiry"));

		return true;
	}

	// custom webhook return
	async modLogCheck(gConfig: GuildConfig) {
		let hook: Eris.Webhook | null = null, guild: Eris.Guild | null = null;
		if (gConfig.modlog.enabled) {
			if (gConfig.modlog.channel) {
				const ch = await this.client.getRESTChannel(gConfig.modlog.channel).catch(() => null);
				if (ch !== null && ch instanceof Eris.TextChannel) void ch.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(ch.guild.name, ch.guild.id)
						.setColor(Colors.red)
						.setDescription("{lang:other.modlog.outdated}")
						.setFooter("OwO", config.images.icons.bot)
						.toJSON()
				}).catch(() => null);
				await gConfig.mongoEdit<DBKeys>({
					$unset: {
						"modlog.channel": 1
					}
				});
			}

			if (gConfig.modlog.webhook) {
				hook = await this.client.getWebhook(gConfig.modlog.webhook.id, gConfig.modlog.webhook.token).catch(() => null);
				if (hook === null) {
					await gConfig.mongoEdit<DBKeys>({
						$set: {
							"modlog.webhook": null
						}
					});
				} else guild = await this.client.getRESTGuild(hook.guild_id).catch(() => null);
				return {
					hook: hook ? new Webhook(this.client, gConfig.modlog.webhook) : null,
					guild
				};
			} else return {
				hook: null,
				guild: null
			};
		}

		return {
			hook: null,
			guild: null
		};
	}
	/* eslint-enable deprecation/deprecation */

	async createLockEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.GuildTextableChannel, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.lock} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.red)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.name} <#${target.id}>`,
							`{lang:other.modlog.fields.reason}: ${reason}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.ChannelLockEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "lock",
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createUnlockEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.GuildTextableChannel, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.unlock} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.green)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.name} <#${target.id}>`,
							`{lang:other.modlog.fields.reason}: ${reason}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.ChannelUnlockEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "unlock",
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createLockdownEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.lockdown} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.red)
						.setDescription([
							`{lang:other.modlog.fields.reason}: ${reason}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.ServerLockdownEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			reason,
			type: "lockdown",
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createUnlockdownEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.unlockdown} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.green)
						.setDescription([
							`{lang:other.modlog.fields.reason}: ${reason}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.ServerUnlockdownEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			reason,
			type: "unlockdown",
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createWarnEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, id: number, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.warn} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.gold)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
							`{lang:other.modlog.fields.reason}: ${reason}`,
							`{lang:other.modlog.fields.id}: ${id}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.WarnEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "warn",
			pos,
			id,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createClearWarningsEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, total: number, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.clearwarnings} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.green)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
							`{lang:other.modlog.fields.totalWarnings}: ${total}`,
							`{lang:other.modlog.fields.reason}: ${reason}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.ClearWarningsEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "clearwarnings",
			pos,
			guildId: gConfig.id,
			totalWarnings: total,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createDeleteWarningEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, oldBlame: string, id: number, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");

		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined, b: string;
		if (!oldBlame) b = "{lang:other.modlog.fields.unknown}";
		else if (!/^[0-9]{15,21}$/.exec(oldBlame)) b = oldBlame;
		else {
			const m = await this.client.getRESTUser(oldBlame).catch(() => null);
			b = `${m?.tag || "Unknown#0000"} (<@!${oldBlame}>)`;
		}
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.delwarn} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.green)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
							`{lang:other.modlog.fields.reason}: ${reason}`,
							`{lang:other.modlog.fields.oldBlame}: ${b}`,
							`{lang:other.modlog.fields.id}: ${id}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.DeleteWarnEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "delwarn",
			pos,
			oldBlame: b,
			id,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createKickEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.kick} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.red)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
							`{lang:other.modlog.fields.reason}: ${reason}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.KickEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "kick",
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createUnbanEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.User, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.unban} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.green)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
							`{lang:other.modlog.fields.reason}: ${reason}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.UnbanEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "unban",
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createUnmuteEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.unmute} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.green)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
							`{lang:other.modlog.fields.reason}: ${reason}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.UnmuteEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "unmute",
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createSoftBanEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, deleteDays?: number | null, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.softban} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.red)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
							`{lang:other.modlog.fields.reason}: ${reason}`,
							`{lang:other.modlog.fields.deleteDays}: ${deleteDays || 0}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.SoftBanEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "softban",
			deleteDays: deleteDays || 0,
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createBanEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.User, expiry?: number | null, deleteDays?: number | null, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.ban} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.red)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
							`{lang:other.modlog.fields.reason}: ${reason}`,
							`{lang:other.modlog.fields.deleteDays}: ${deleteDays || 0}`,
							`{lang:other.modlog.fields.time}: ${!expiry ? "{lang:other.modlog.fields.permanent}" : Time.ms(expiry, true)}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.BanEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "ban",
			expiry: expiry || null,
			deleteDays: deleteDays || 0,
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createMuteEntry(ch: Eris.GuildTextableChannel, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, expiry?: number | null, reason?: string | null): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { hook, guild } = await this.modLogCheck(gConfig);
		const { enabled } = gConfig.modlog;
		if (blame && blame !== "automatic" && !(blame instanceof Eris.User)) blame = await this.client.getRESTUser(blame).catch(() => ({ tag: "Unknown#0000", id: null, avatarURL: null } as unknown as Eris.User));
		let res: Eris.Message<Eris.TextableChannel> | Error | undefined;
		if (enabled && hook && guild) {
			res = await hook.execute({
				embeds: [
					new EmbedBuilder(gConfig.settings.lang)
						.setAuthor(guild.name, guild.iconURL!)
						.setTitle(`{lang:other.modlog.titles.mute} | {lang:other.modlog.titles.general|${pos}}`)
						.setColor(Colors.red)
						.setDescription([
							`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
							`{lang:other.modlog.fields.reason}: ${reason}`,
							`{lang:other.modlog.fields.time}: ${!expiry ? "{lang:other.modlog.fields.permanent}" : Time.ms(expiry, true)}`
						].join("\n"))
						.setFooter(...(blame instanceof Eris.User ? [`{lang:other.modlog.action|${blame.username}#${blame.discriminator}}`, blame.avatarURL] : [Language.get(gConfig.settings.lang, "other.modlog.autoAction"), config.images.icons.bot]) as [text: string, iconURL: string])
						.toJSON()
				]
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await db.collection<ModLogEntry.MuteEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "mute",
			expiry: expiry || null,
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}
}
