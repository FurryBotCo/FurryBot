import FurryBot from "../main";
import Eris from "eris";
import EmbedBuilder from "./EmbedBuilder";
import db, { mdb } from "../modules/Database";
import { Time, Strings } from "./Functions";
import { Colors } from "./Constants";
import config from "../config";

export default class ModLogUtil {
	client: FurryBot;
	constructor(client: FurryBot) {
		this.client = client;
	}

	async create<B = Eris.User | string | "automatic", C extends Eris.GuildTextableChannel = Eris.GuildTextableChannel>(ch: C, data: { type: "custom"; embed: Eris.EmbedOptions | EmbedBuilder; } | {
		blame: B;
		target: Eris.GuildTextableChannel;
		reason?: string;
		type: "lock" | "unlock";
	} | {
		blame: B;
		target: Eris.User | Eris.Member;
		reason?: string;
		id: number;
		type: "warn";
	} | {
		blame: B;
		target: Eris.User | Eris.Member;
		reason?: string;
		totalWarnings: number;
		type: "clearwarnings";
	} | {
		blame: B;
		oldBlame: string;
		target: Eris.User | Eris.Member;
		reason?: string;
		id: string | number; // string is legacy
		type: "rmwarn" | "delwarn";
	} | {
		blame: B;
		target: Eris.User | Eris.Member;
		reason?: string;
		type: "kick" | "unban" | "unmute";
	} | {
		blame: B;
		target: Eris.User | Eris.Member;
		reason?: string;
		deleteDays?: number;
		type: "softban";
	} | {
		blame: B;
		target: Eris.User | Eris.Member;
		reason?: string;
		time?: number;
		deleteDays?: number;
		type: "ban";
	} | {
		blame: B;
		target: Eris.User | Eris.Member;
		reason?: string;
		time?: number;
		type: "mute";
	}): Promise<Eris.Message<C>> {
		const g = await db.getGuild(ch.guild.id);
		if (!g.settings.modlog) return null;
		if (!ch.guild.channels.has(g.settings.modlog)) {
			await ch.createMessage("{lang:other.modlog.invalid}").catch(err => null);
			await g.edit({
				settings: {
					modlog: null
				}
			});
		}
		if (!["sendMessages", "embedLinks"].some(p => ch.guild.channels.get(g.settings.modlog).permissionsOf(this.client.user.id).has(p))) {
			await ch.createMessage("{lang:other.modlog.missingPermissions}").catch(err => null);
			await g.edit({
				settings: {
					modlog: null
				}
			});
		}
		let reason: string;
		const pos = await db.getModlogEntryId(g.id);
		const embed =
			new EmbedBuilder(g.settings.lang)
				.setAuthor(ch.guild.name, ch.guild.iconURL);

		if (data.type !== "custom") {
			const blame = data.blame instanceof Eris.User ? `${data.blame.username}#${data.blame.discriminator}` : !data.blame || ["automatic"].includes((data.blame as unknown as string).toLowerCase()) ? null : data.blame as unknown as string;
			embed.setFooter(!blame ? "{lang:other.modlog.actionAuto}" : `{lang:other.modlog.action|${blame}}`, !blame ? config.images.botIcon : (data.blame as unknown as Eris.User).avatarURL);
			reason = !!data.reason ? data.reason : "None Provided";
		}


		switch (data.type) {
			case "ban": {
				await mdb.collection<ModLogEntry.BanEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "ban",
					time: data.time,
					deleteDays: data.deleteDays,
					pos,
					guildId: g.id
				});

				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.ban}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.deleteDays}: ${data.deleteDays}`,
						`{lang:other.modlog.fields.time}: ${!data.time ? "{lang:other.modlog.fields.permanent}" : Time.ms(data.time, true)}`
					].join("\n"));
				break;
			}

			case "mute": {
				await mdb.collection<ModLogEntry.MuteEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "mute",
					time: data.time,
					pos,
					guildId: g.id
				});

				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.mute}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.time}: ${!data.time ? "{lang:other.modlog.fields.permanent}" : Time.ms(data.time, true)}`
					].join("\n"));
				break;
			}

			case "kick": {
				await mdb.collection<ModLogEntry.KickEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "kick",
					pos,
					guildId: g.id
				});

				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.kick}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"));
				break;
			}

			case "softban": {
				await mdb.collection<ModLogEntry.SoftBanEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "softban",
					deleteDays: data.deleteDays,
					pos,
					guildId: g.id
				});

				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.softban}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.deleteDays}: ${data.deleteDays}`
					].join("\n"));
				break;
			}

			case "unban": {
				await mdb.collection<ModLogEntry.UnbanEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "unban",
					pos,
					guildId: g.id
				});

				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.unban}`)
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"));
				break;
			}

			case "unmute": {
				await mdb.collection<ModLogEntry.UnmuteEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "unmute",
					pos,
					guildId: g.id
				});

				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.unmute}`)
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"));
				break;
			}

			case "warn": {
				await mdb.collection<ModLogEntry.WarnEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "warn",
					pos,
					guildId: g.id,
					id: data.id as any
				});

				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.warn}`)
					.setColor(Colors.gold)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.id}: ${data.id}`
					].join("\n"));
				break;
			}

			case "delwarn": {
				let b: string;
				if (!data.oldBlame) b = "{lang:other.modlog.fields.unknown}";
				else if (!data.oldBlame.match("^[0-9]{17,19}$")) b = data.oldBlame;
				else if (ch.guild.members.has(data.oldBlame)) {
					const m = ch.guild.members.get(data.oldBlame);
					b = `${m.username}#${m.discriminator} (<@!${m.id}>)`;
				} else if (this.client.users.has(data.oldBlame)) {
					const m = this.client.users.get(data.oldBlame);
					b = `${m.username}#${m.discriminator} (<@!${m.id}>)`;
				} else {
					const m = await this.client.getRESTUser(data.oldBlame);
					b = `${m.username}#${m.discriminator} (<@!${m.id}>)`;
				}
				await mdb.collection<ModLogEntry.DeleteWarnEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "delwarn",
					pos,
					guildId: g.id,
					oldBlame: b,
					id: data.id as any
				});

				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.delwarn}`)
					.setColor(Colors.gold)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.warningReason}: ${reason}`,
						`{lang:other.modlog.fields.oldBlame}: ${b}`,
						`{lang:other.modlog.fields.id}: ${data.id}`
					].join("\n"));
				break;
			}

			case "clearwarnings": {
				await mdb.collection<ModLogEntry.ClearWarningsEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "clearwarnings",
					pos,
					guildId: g.id,
					totalWarnings: data.totalWarnings
				});
				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.clearwarnings}`)
					.setColor(Colors.gold)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.totalWarnings}: ${data.totalWarnings}`
					].join("\n"));
				break;
			}

			case "lock": {
				await mdb.collection<ModLogEntry.ChannelLockEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "lock",
					pos,
					guildId: g.id
				});

				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.lock}`)
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.name} <#${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"));
				break;
			}

			case "unlock": {
				await mdb.collection<ModLogEntry.ChannelUnlockEntry>("modlog").insertOne({
					blame: data.blame instanceof Eris.User ? data.blame.id : data.blame as unknown as string,
					target: data.target.id,
					reason,
					type: "unlock",
					pos,
					guildId: g.id
				});

				embed
					.setTitle(`{lang:other.modlog.titles.general|${pos}} | {lang:other.modlog.titles.unlock}`)
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.name} <#${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"));
				break;
			}

			case "custom": {
				embed.loadEmbedData(data.embed);
				break;
			}
		}

		embed.setTimestamp(new Date().toISOString());

		const mdl = ch.guild.channels.get<Eris.GuildTextableChannel>(g.settings.modlog);
		return mdl.createMessage({
			embed: embed.toJSON()
		}).catch(err => null);
	}
}
