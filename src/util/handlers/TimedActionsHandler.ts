import FurryBot from "../../bot";
import db, { mdb } from "../Database";
import { ObjectId } from "mongodb";
import Eris from "eris";
import Logger from "../Logger";
import Language from "../Language";
import EmbedBuilder from "../EmbedBuilder";
import { Colors } from "../Constants";

export default class TimedActionsHandler {
	#client: FurryBot;
	#interval: NodeJS.Timeout;
	constructor(client: FurryBot) {
		this.#client = client;
		this.#interval = setInterval(this.processEntries.bind(this), 1e3);
	}

	get col() { return mdb.collection<TimedEntry>("timed"); }

	async deleteEntry(id: ObjectId | TimedEntry) {
		if (!(id instanceof ObjectId)) id = id._id;
		return this.col.findOneAndDelete({ _id: id });
	}

	async addEntry(type: "ban" | "mute", time: number, expiry: number, userId: string, guildId: string, reason: string) {
		return this.col.insertOne({
			type,
			time,
			expiry,
			userId,
			guildId,
			reason
		});
	}

	async processEntries() {
		const entries = await this.col.find({}).toArray();
		for (const entry of entries) {
			if (entry.expiry > Date.now()) continue;
			await entry.type === "ban" ? this.handleBanEntry(entry as any) : this.handleMuteEntry(entry as any);
		}
	}

	async handleBanEntry(entry: TimedEntry<"ban">) {
		const g = this.#client.bot.guilds.get(entry.guildId) || await this.#client.bot.getRESTGuild(entry.guildId);
		if (!g) return this.deleteEntry(entry);

		await g.unbanMember(entry.userId, "Automatic Unban").catch(err => null);

		const c = await db.getGuild(entry.guildId);
		const u = this.#client.bot.users.get(entry.userId) || await this.#client.bot.getRESTUser(entry.userId).catch(err => null);
		if (!c.settings.modlog) return this.deleteEntry(entry);
		const ch = (g.channels.get(c.settings.modlog) || this.#client.bot.getRESTChannel(c.settings.modlog).catch(err => null)) as Eris.GuildTextableChannel;
		if (!ch || typeof ch.permissionsOf !== "function") {
			await this.deleteEntry(entry);
			await c.edit({
				settings: {
					modlog: null
				}
			});
			Logger.warn("Timed Actions Handler", `Failed to send modlog to "${entry.guildId}" because its modlog channel does not exist.`);
			return;
		}

		if (["sendMessages", "embedLinks"].some(p => !ch.permissionsOf(this.#client.bot.user.id).has(p))) {
			await this.deleteEntry(entry);
			await c.edit({
				settings: {
					modlog: null
				}
			});
			Logger.warn("Timed Actions Handler", `Failed to send modlog to "${entry.guildId}" because I am missing permissions.`);
			return;
		}

		await this.deleteEntry(entry);
		await this.#client.m.createUnbanEntry(ch, "automatic", u, Language.get(c.settings.lang, "other.modlog.autoExpiry"));
	}

	async handleMuteEntry(entry: TimedEntry<"mute">) {
		const g = this.#client.bot.guilds.get(entry.guildId) || await this.#client.bot.getRESTGuild(entry.guildId);
		if (!g) return this.deleteEntry(entry);
		const m: Eris.Member = g.members.get(entry.userId) || await g.getRESTMember(entry.userId).catch(err => null);

		const c = await db.getGuild(entry.guildId);
		const u = this.#client.bot.users.get(entry.userId) || await this.#client.bot.getRESTUser(entry.userId).catch(err => null);
		if (!c.settings.modlog) return this.deleteEntry(entry);
		const ch = (g.channels.get(c.settings.modlog) || this.#client.bot.getRESTChannel(c.settings.modlog).catch(err => null)) as Eris.GuildTextableChannel;
		if (!ch || typeof ch.permissionsOf !== "function") {
			await this.deleteEntry(entry);
			await c.edit({
				settings: {
					modlog: null
				}
			});
			Logger.warn("Timed Actions Handler", `Failed to send modlog to "${entry.guildId}" because its modlog channel does not exist.`);
			return;
		}

		if (["sendMessages", "embedLinks"].some(p => !ch.permissionsOf(this.#client.bot.user.id).has(p))) {
			await this.deleteEntry(entry);
			await c.edit({
				settings: {
					modlog: null
				}
			});
			Logger.warn("Timed Actions Handler", `Failed to send modlog to "${entry.guildId}" because I am missing permissions.`);
			return;
		}

		if (!g.roles.has(c.settings.muteRole)) {
			await this.deleteEntry(entry);
			await c.edit({
				settings: {
					muteRole: null
				}
			});
			return;
		}

		if (!m) {
			await ch.createMessage({
				embed: new EmbedBuilder(c.settings.lang)
					.setTitle("{lang:other.modlog.autoUnmuteFail.title}")
					.setDescription(`{lang:other.modlog.autoUnmuteFail.description|${!u ? "Unknown#0000" : `${u.username}#${u.discriminator}`}|${entry.userId}|${Language.get(c.settings.lang, "other.modlog.autoUnmuteFail.reasonNotPresent")}`)
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.red)
					.setAuthor(`${this.#client.bot.user.username}#${this.#client.bot.user.discriminator}`, this.#client.bot.user.avatarURL)
					.toJSON()
			});
			return this.deleteEntry(entry);
		}

		if (!m.roles.includes(c.settings.muteRole)) return this.deleteEntry(entry);

		const v = await m.removeRole(c.settings.muteRole, "Automatic Unmute").catch(err => err);
		if (m.voiceState.mute) m.edit({ mute: false }, "Automatic Unmute");

		if (v === null) {
			await ch.createMessage({
				embed: new EmbedBuilder(c.settings.lang)
					.setTitle("{lang:other.modlog.autoUnmuteFail.title}")
					.setDescription(`{lang:other.modlog.autoUnmuteFail.description|${!u ? "Unknown#0000" : `${u.username}#${u.discriminator}`}|${entry.userId}|${v.name}: ${v.message}}`)
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.red)
					.setAuthor(`${this.#client.bot.user.username}#${this.#client.bot.user.discriminator}`, this.#client.bot.user.avatarURL)
					.toJSON()
			});
			return this.deleteEntry(entry);
		}

		await this.deleteEntry(entry);
		await this.#client.m.createUnmuteEntry(ch, "automatic", u, Language.get(c.settings.lang, "other.modlog.autoExpiry"));
	}
}
