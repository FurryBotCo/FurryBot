import FurryBot from "../../main";
import db, { mdb } from "../Database";
import { ObjectId } from "mongodb";
import Eris from "eris";
import Logger from "../Logger";
import Language from "../Language";
import EmbedBuilder from "../EmbedBuilder";
import { Colors } from "../Constants";

export default class TimedActionsHandler {
	private client: FurryBot;
	private interval: NodeJS.Timeout;
	constructor(client: FurryBot) {
		this.client = client;
		this.interval = setInterval(this.processEntries.bind(this), 5e3);
	}

	get col() {
		return mdb.collection<TimedEntry>("timed");
	}

	async deleteEntry(id: ObjectId | TimedEntry) {
		if (!(id instanceof ObjectId)) id = id._id;
		Logger.debug(["Timed Actions Handler", "Delete Entry"], id);
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
			await entry.type === "ban" ? this.handleBanEntry(entry as any) : this.handleMuteEntry(entry as any); // eslint-disable-line
		}
	}

	async handleBanEntry(entry: TimedEntry<"ban">) {
		if (!entry.expiry) return this.deleteEntry(entry);
		const g: Eris.Guild | null = this.client.bot.guilds.get(entry.guildId) || await this.client.bot.getRESTGuild(entry.guildId).catch(err => null) || null;
		if (g === null) return this.deleteEntry(entry);

		const user: Eris.User | null = this.client.bot.users.get(entry.userId) || await this.client.getUser(entry.userId).catch(err => null) || null;
		if (user === null) return this.deleteEntry(entry);
		await g.unbanMember(user.id, "Automatic Unban").catch(err => null);

		const s = await db.getGuild(g.id);

		let ch: Eris.GuildTextableChannel | null;

		if (s.modlog.enabled) ch = await g.getRESTChannels().then(v => v.find(c => c.id === s.modlog.channel)).then(v => !v ? null : v as Eris.GuildTextableChannel).catch(err => null);

		await this.client.m.createUnbanEntry(ch, s, "automatic", user, Language.get(s.settings.lang, "other.modlog.autoExpiry"));

		this.deleteEntry(entry);
	}

	async handleMuteEntry(entry: TimedEntry<"mute">) {
		if (!entry.expiry) return this.deleteEntry(entry);
		const g: Eris.Guild | null = this.client.bot.guilds.get(entry.guildId) || await this.client.bot.getRESTGuild(entry.guildId).catch(err => null) || null;
		if (g === null) return this.deleteEntry(entry);

		const member: Eris.Member | null = g.members.get(entry.userId) || await g.getRESTMember(entry.userId).catch(err => null) || null;

		if (member === null) return this.deleteEntry(entry);

		const s = await db.getGuild(g.id);
		let ch: Eris.GuildTextableChannel | null;
		const { enabled } = s.modlog;
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
			ch = g.channels.get(s.modlog.channel) || await this.client.bot.getRESTChannel(s.modlog.channel).catch(err => null) || null;
			if (ch) {
				if (rm instanceof Error) {
					await ch.createMessage({
						embed: new EmbedBuilder(s.settings.lang)
							.setTitle("{lang:other.modlog.autoUnmuteFail.title}")
							.setDescription(`{lang:other.modlog.autoUnmuteFail.description|${member.username}#${member.discriminator}|${entry.userId}|${Language.get(s.settings.lang, "other.modlog.autoUnmuteFail.reasonNotPresent")}`)
							.setTimestamp(new Date().toISOString())
							.setColor(Colors.red)
							.setAuthor(`${this.client.bot.user.username}#${this.client.bot.user.discriminator}`, this.client.bot.user.avatarURL)
							.toJSON()
					});
					return this.deleteEntry(entry);
				}
			} else await s.edit({
				modlog: {
					enabled: false,
					channel: null
				}
			});
		}

		await this.client.m.createUnmuteEntry(ch, s, "automatic", member, Language.get(s.settings.lang, "other.modlog.autoExpiry"));

		this.deleteEntry(entry);
	}
}
