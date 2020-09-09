import FurryBot from "../../bot";
import db, { mdb } from "../Database";
import { ObjectId } from "mongodb";
import Eris from "eris";
import Logger from "../Logger";
import Language from "../Language";
import EmbedBuilder from "../EmbedBuilder";
import { Colors } from "../Constants";

export default class TimedActionsHandler {
	client: FurryBot;
	#interval: NodeJS.Timeout;
	constructor(client: FurryBot) {
		this.client = client;
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
		const g = await this.client.bot.getRESTGuild(entry.guildId);
		if (!g) return this.deleteEntry(entry);

		const user = await this.client.bot.getRESTUser(entry.userId).catch(err => null);
		if (user === null) return this.deleteEntry(entry);
		await g.unbanMember(user.id, "Automatic Unban").catch(err => null);

		const s = await db.getGuild(g.id);
		let ch: Eris.GuildTextableChannel;
		const l = await g.getRESTChannels();
		const { enabled, webhook } = s.modlog;

		if (enabled) {
			const w: Eris.Webhook | null = await this.client.bot.getWebhook(webhook.id, webhook.token).catch(err => null);
			if (w) ch = l.find(v => v.id === w.channel_id) as Eris.GuildTextableChannel;
			else await s.edit({
				modlog: {
					enabled: false,
					webhook: {
						id: null,
						token: null
					}
				}
			});
		}

		if (!ch && g.systemChannelID) ch = l.find(c => c.id) as Eris.GuildTextableChannel;
		else if (!ch) ch = null;

		await this.client.m.createUnbanEntry(ch, s, "automatic", user, Language.get(s.settings.lang, "other.modlog.autoExpiry"));
	}

	async handleMuteEntry(entry: TimedEntry<"mute">) {
		const g = await this.client.bot.getRESTGuild(entry.guildId);
		if (!g) return this.deleteEntry(entry);

		const member = await g.getRESTMember(entry.userId);

		if (!member) return this.deleteEntry(entry);

		const s = await db.getGuild(g.id);
		let ch: Eris.GuildTextableChannel;
		const l = await g.getRESTChannels();
		const { enabled, webhook } = s.modlog;
		if (!member.roles.includes(s.settings.muteRole)) return this.deleteEntry(entry);
		if (!g.roles.has(s.settings.muteRole)) {
			await s.edit({
				settings: {
					muteRole: null
				}
			});
			return this.deleteEntry(entry);
		}

		const rm = await member.removeRole(s.settings.muteRole, "Automatic Unmute").then(() => true as const).catch(err => err as Error);
		if (member.voiceState.mute) await member.edit({ mute: false }, "Automatic Unmute");

		if (enabled) {
			const w: Eris.Webhook | null = await this.client.bot.getWebhook(webhook.id, webhook.token).catch(err => null);
			if (w) {
				ch = l.find(v => v.id === w.channel_id) as Eris.GuildTextableChannel;
				if (rm instanceof Error) {
					await this.client.bot.executeWebhook(webhook.id, webhook.token, {
						embeds: [
							new EmbedBuilder(s.settings.lang)
								.setTitle("{lang:other.modlog.autoUnmuteFail.title}")
								.setDescription(`{lang:other.modlog.autoUnmuteFail.description|${member.username}#${member.discriminator}|${entry.userId}|${Language.get(s.settings.lang, "other.modlog.autoUnmuteFail.reasonNotPresent")}`)
								.setTimestamp(new Date().toISOString())
								.setColor(Colors.red)
								.setAuthor(`${this.client.bot.user.username}#${this.client.bot.user.discriminator}`, this.client.bot.user.avatarURL)
								.toJSON()
						]
					});
					return this.deleteEntry(entry);
				}
			} else await s.edit({
				modlog: {
					enabled: false,
					webhook: {
						id: null,
						token: null
					}
				}
			});
		}

		if (!ch && g.systemChannelID) ch = l.find(c => c.id) as Eris.GuildTextableChannel;
		else if (!ch) ch = null;

		await this.client.m.createUnmuteEntry(ch, s, "automatic", member, Language.get(s.settings.lang, "other.modlog.autoExpiry"));
	}
}
