import FurryBot from "../main";
import Eris from "eris";
import { mdb } from "./Database";
import Language from "./Language";
import EmbedBuilder from "./EmbedBuilder";
import { Colors } from "./Constants";
import Time from "./Functions/Time";
import GuildConfig from "./config/GuildConfig";

type Blame = Eris.User | "automatic";

class CustomError extends Error {
	constructor(name: string, message: string) {
		super(message);
		this.name = name;
	}
}

export default class ModLogUtil {
	client: FurryBot;
	constructor(client: FurryBot) {
		this.client = client;
	}

	async modLogCheck(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig) {
		const { enabled } = gConfig.modlog;
		const g: Eris.Guild | null = this.client.bot.guilds.get(gConfig.id) || await this.client.bot.getRESTGuild(gConfig.id).catch(err => null) || null;
		let ml: Eris.GuildTextableChannel | null;
		if (enabled) {
			ml = g.channels.get(gConfig.modlog.channel) || await this.client.bot.getRESTChannel(gConfig.modlog.channel).catch(err => null) || null;
			if (!ml) {
				await gConfig.edit({
					modlog: {
						enabled: false,
						channel: null
					}
				});
				await ch.createMessage(Language.get(gConfig.settings.lang, "other.modlog.invalidChannel")).catch(err => null);
			}
		}

		return {
			g,
			ml
		};
	}

	async createEntry(type: "lock", ...args: Parameters<ModLogUtil["createLockEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "unlock", ...args: Parameters<ModLogUtil["createUnlockEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "lockdown", ...args: Parameters<ModLogUtil["createLockdownEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "unlockdown", ...args: Parameters<ModLogUtil["createUnlockdownEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "warn", ...args: Parameters<ModLogUtil["createWarnEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "clearwarnings", ...args: Parameters<ModLogUtil["createClearWarningsEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "delwarn", ...args: Parameters<ModLogUtil["createDeleteWarningEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "kick", ...args: Parameters<ModLogUtil["createKickEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "unban", ...args: Parameters<ModLogUtil["createUnbanEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "unmute", ...args: Parameters<ModLogUtil["createUnmuteEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "softban", ...args: Parameters<ModLogUtil["createSoftBanEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "ban", ...args: Parameters<ModLogUtil["createBanEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: "mute", ...args: Parameters<ModLogUtil["createMuteEntry"]>): Promise<Eris.Message<Eris.GuildTextableChannel>>;
	async createEntry(type: string, ...args: any[]): Promise<Eris.Message<Eris.GuildTextableChannel>> {
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

	async createLockEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.GuildTextableChannel, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.lock} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.name} <#${target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.ChannelLockEntry>("modlog").insertOne({
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

	async createUnlockEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.GuildTextableChannel, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.unlock} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.name} <#${target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.ChannelUnlockEntry>("modlog").insertOne({
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

	async createLockdownEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.lockdown} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.ServerLockdownEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			reason,
			type: "lockdown",
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createUnlockdownEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.unlockdown} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.ServerUnlockdownEntry>("modlog").insertOne({
			blame: blame instanceof Eris.User ? blame.id : blame,
			reason,
			type: "unlockdown",
			pos,
			guildId: gConfig.id,
			messageId: res instanceof Eris.Message ? res.id : null,
			creationDate: Date.now()
		});
	}

	async createWarnEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, id: number, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.warn} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.gold)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.id}: ${id}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.WarnEntry>("modlog").insertOne({
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

	async createClearWarningsEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, total: number, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.clearwarnings} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
						`{lang:other.modlog.fields.totalWarnings}: ${total}`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.ClearWarningsEntry>("modlog").insertOne({
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

	async createDeleteWarningEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, oldBlame: string, id: number, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");

		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error, b: string;
		if (!oldBlame) b = "{lang:other.modlog.fields.unknown}";
		else if (!oldBlame.match("^[0-9]{15,21}$")) b = oldBlame;
		else if (ch.guild.members.has(oldBlame)) {
			const m = ch.guild.members.get(oldBlame);
			b = `${m.username}#${m.discriminator} (<@!${m.id}>)`;
		} else if (this.client.bot.users.has(oldBlame)) {
			const m = this.client.bot.users.get(oldBlame);
			b = `${m.username}#${m.discriminator} (<@!${m.id}>)`;
		} else {
			const m = await this.client.getUser(oldBlame);
			b = `${m.username}#${m.discriminator} (<@!${m.id}>)`;
		}
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.delwarn} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.oldBlame}: ${b}`,
						`{lang:other.modlog.fields.id}: ${id}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.DeleteWarnEntry>("modlog").insertOne({
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

	async createKickEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.kick} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.KickEntry>("modlog").insertOne({
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

	async createUnbanEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.User, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.unban} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.UnbanEntry>("modlog").insertOne({
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

	async createUnmuteEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.unmute} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.UnmuteEntry>("modlog").insertOne({
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

	async createSoftBanEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, deleteDays?: number, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.softban} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.deleteDays}: ${deleteDays || 0}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.SoftBanEntry>("modlog").insertOne({
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

	async createBanEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.User, expiry?: number, deleteDays?: number, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.ban} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.deleteDays}: ${deleteDays || 0}`,
						`{lang:other.modlog.fields.time}: ${!expiry ? "{lang:other.modlog.fields.permanent}" : Time.ms(expiry, true)}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.BanEntry>("modlog").insertOne({
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

	async createMuteEntry(ch: Eris.GuildTextableChannel | null, gConfig: GuildConfig, blame: Blame, target: Eris.Member | Eris.User, expiry?: number, reason?: string): Promise<void> {
		const pos = await gConfig.getModlogId();
		if (!reason) reason = Language.get(gConfig.settings.lang, "other.modlog.noReason");
		const { g, ml } = await this.modLogCheck(ch, gConfig);
		const { enabled } = gConfig.modlog;
		let res: Eris.Message<Eris.TextableChannel> | Error;
		if (enabled) {
			res = await ml.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setAuthor(g.name, g.iconURL)
					.setTitle(`{lang:other.modlog.titles.mute} | {lang:other.modlog.titles.general|${pos}}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${target.username}#${target.discriminator} <@!${target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.time}: ${!expiry ? "{lang:other.modlog.fields.permanent}" : Time.ms(expiry, true)}`
					].join("\n"))
					.setFooter(blame instanceof Eris.User ? `{lang:other.modlog.action|${blame.username}#${blame.discriminator}}` : Language.get(gConfig.settings.lang, "other.modlog.autoAction"), blame === "automatic" ? ch.client.user.avatarURL : blame.avatarURL)
					.toJSON()
			}).catch(err => err as Error);
			if (res instanceof Error) throw new CustomError(res.name, res.message);
		}
		await mdb.collection<ModLogEntry.MuteEntry>("modlog").insertOne({
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
