import FurryBot from "../bot";
import Eris from "eris";
import db, { mdb } from "./Database";
import Language from "./Language";
import EmbedBuilder from "./EmbedBuilder";
import { Colors } from "./Constants";
import Time from "./Functions/Time";

type Blame = Eris.User | "automatic";

class CustomError extends Error {
	constructor(name: string, message: string) {
		super(message);
		this.name = name;
	}
}

export default class ModLogUtil {
	#client: FurryBot;
	constructor(client: FurryBot) {
		this.#client = client;
	}

	async getEntryId(guildId: string) {
		return (await mdb.collection<ModLogEntry.GenericEntry>("modlog").find({ guildId }).count()) + 1;
	}

	async modLogCheck<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C) {
		const g = await db.getGuild(ch.guild.id);
		if (!g.settings.modlog) return false;
		const m = ch.guild.channels.get(g.settings.modlog);
		if (!m) {
			await ch.createMessage(Language.get(g.settings.lang, "other.modlog.invalidChannel")).catch(err => null);
			await g.edit({
				settings: {
					modlog: null
				}
			});
			return false;
		}

		if (["sendMessages", "embedLinks"].some(p => !m.permissionsOf(ch.client.user.id).has(p))) {
			await ch.createMessage(Language.get(g.settings.lang, "other.modlog.missingPermissions")).catch(err => null);
			await g.edit({
				settings: {
					modlog: null
				}
			});
			return false;
		}

		return true;
	}

	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "lock", ...args: Parameters<ModLogUtil["createLockEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "unlock", ...args: Parameters<ModLogUtil["createUnlockEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "lockdown", ...args: Parameters<ModLogUtil["createLockdownEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "unlockdown", ...args: Parameters<ModLogUtil["createUnlockdownEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "warn", ...args: Parameters<ModLogUtil["createWarnEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "clearwarnings", ...args: Parameters<ModLogUtil["createClearWarningsEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "delwarn", ...args: Parameters<ModLogUtil["createDeleteWarningEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "kick", ...args: Parameters<ModLogUtil["createKickEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "unban", ...args: Parameters<ModLogUtil["createUnbanEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "unmute", ...args: Parameters<ModLogUtil["createUnmuteEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "softban", ...args: Parameters<ModLogUtil["createSoftBanEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "ban", ...args: Parameters<ModLogUtil["createBanEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: "mute", ...args: Parameters<ModLogUtil["createMuteEntry"]>): Promise<Eris.Message<C>>;
	async createEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(type: string, ...args: any[]): Promise<Eris.Message<C>> {
		// ts doesn't deal with spread operator on functions very well
		switch (type) {
			case "lock": return (this.createLockEntry as any)(...args);
			case "unlock": return (this.createUnlockEntry as any)(...args);
			case "lockdown": return (this.createLockdownEntry as any)(...args);
			case "unlockdown": return (this.createUnlockdownEntry as any)(...args);
			case "warn": return (this.createWarnEntry as any)(...args);
			case "clearwarnings": return (this.createClearWarningsEntry as any)(...args);
			case "delwarn": return (this.createDeleteWarningEntry as any)(...args);
			case "kick": return (this.createKickEntry as any)(...args);
			case "unban": return (this.createUnbanEntry as any)(...args);
			case "unmute": return (this.createUnmuteEntry as any)(...args);
			case "softban": return (this.createSoftBanEntry as any)(...args);
			case "ban": return (this.createBanEntry as any)(...args);
			case "mute": return (this.createMuteEntry as any)(...args);
			default: throw new TypeError(`Invalid mod log type "${type}"`);
		}
	}

	async createLockEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.GuildTextableChannel, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.lock} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.name} <#${target.id}>`,
					`{lang:other.modlog.fields.reason}: ${reason}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.ChannelLockEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "lock",
			pos,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}

	async createUnlockEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.GuildTextableChannel, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.unlock} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.name} <#${target.id}>`,
					`{lang:other.modlog.fields.reason}: ${reason}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.ChannelUnlockEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "unlock",
			pos,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}

	async createLockdownEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.lockdown} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.reason}: ${reason}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.ServerLockdownEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			reason,
			type: "lockdown",
			pos,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}

	async createUnlockdownEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.unlockdown} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.reason}: ${reason}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.ServerUnlockdownEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			reason,
			type: "unlockdown",
			pos,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}

	async createWarnEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.Member | Eris.User, id: number, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.warn} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
					`{lang:other.modlog.fields.reason}: ${reason}`,
					`{lang:other.modlog.fields.id}: ${id}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.WarnEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "warn",
			pos,
			id,
			guildId: g.id,
			messageId: msg?.id
		});
		return msg;
	}

	async createClearWarningsEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.Member | Eris.User, total: number, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.clearwarnings} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
					`{lang:other.modlog.fields.totalWarnings}: ${total}`,
					`{lang:other.modlog.fields.reason}: ${reason}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.ClearWarningsEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "clearwarnings",
			pos,
			guildId: g.id,
			totalWarnings: total,
			messageId: msg.id
		});
		return msg;
	}

	async createDeleteWarningEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.Member | Eris.User, oldBlame: string, id: number, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		let b: string;
		if (!oldBlame) b = "{lang:other.modlog.fields.unknown}";
		else if (!oldBlame.match("^[0-9]{15,21}$")) b = oldBlame;
		else if (ch.guild.members.has(oldBlame)) {
			const m = ch.guild.members.get(oldBlame);
			b = `${m.username}#${m.discriminator} (<@!${m.id}>)`;
		} else if (this.#client.bot.users.has(oldBlame)) {
			const m = this.#client.bot.users.get(oldBlame);
			b = `${m.username}#${m.discriminator} (<@!${m.id}>)`;
		} else {
			const m = await this.#client.bot.getRESTUser(oldBlame);
			b = `${m.username}#${m.discriminator} (<@!${m.id}>)`;
		}
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.delwarn} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
					`{lang:other.modlog.fields.reason}: ${reason}`,
					`{lang:other.modlog.fields.oldBlame}: ${b}`,
					`{lang:other.modlog.fields.id}: ${id}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.DeleteWarnEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "delwarn",
			pos,
			oldBlame: b,
			id,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}

	async createKickEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.Member | Eris.User, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.kick} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
					`{lang:other.modlog.fields.reason}: ${reason}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.KickEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "kick",
			pos,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}

	async createUnbanEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.User, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.unban} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
					`{lang:other.modlog.fields.reason}: ${reason}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.UnbanEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "unban",
			pos,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}

	async createUnmuteEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.Member | Eris.User, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.unmute} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
					`{lang:other.modlog.fields.reason}: ${reason}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.UnmuteEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "unmute",
			pos,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}

	async createSoftBanEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.Member | Eris.User, deleteDays?: number, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.softban} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
					`{lang:other.modlog.fields.reason}: ${reason}`,
					`{lang:other.modlog.fields.deleteDays}: ${deleteDays || 0}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.SoftBanEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "softban",
			deleteDays: deleteDays || 0,
			pos,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}

	async createBanEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.User, time?: number, deleteDays?: number, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.ban} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
					`{lang:other.modlog.fields.reason}: ${reason}`,
					`{lang:other.modlog.fields.deleteDays}: ${deleteDays || 0}`,
					`{lang:other.modlog.fields.time}: ${!time ? "{lang:other.modlog.fields.permanent}" : Time.ms(time, true)}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.BanEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "ban",
			time: time || null,
			deleteDays: deleteDays || 0,
			pos,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}

	async createMuteEntry<C extends Eris.GuildTextableChannel = Eris.TextChannel>(ch: C, blame: Blame, target: Eris.Member | Eris.User, time?: number, reason?: string): Promise<Eris.Message<C>> {
		if (!(await this.modLogCheck(ch))) return null;
		const g = await db.getGuild(ch.guild.id);
		const pos = await this.getEntryId(g.id);
		if (!reason) reason = Language.get(g.settings.lang, "other.modlog.noReason");
		const msg: Eris.Message<C> = await (ch.guild.channels.get(g.settings.modlog) as C).createMessage({
			embed: new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL)
				.setTitle(`{lang:other.modlog.titles.mute} | {lang:other.modlog.titles.general|${pos}}`)
				.setColor(Colors.red)
				.setDescription([
					`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
					`{lang:other.modlog.fields.reason}: ${reason}`,
					`{lang:other.modlog.fields.time}: ${!time ? "{lang:other.modlog.fields.permanent}" : Time.ms(time, true)}`
				].join("\n"))
				.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(g.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
				.toJSON()
		}).catch(err => err);
		if (msg instanceof Error) throw new CustomError(msg.name, msg.message);
		await mdb.collection<ModLogEntry.MuteEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			target: target.id,
			reason,
			type: "mute",
			time: time || null,
			pos,
			guildId: g.id,
			messageId: msg.id
		});
		return msg;
	}
}
