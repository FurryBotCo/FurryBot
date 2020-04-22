import FurryBot from "../main";
import Eris from "eris";
import EmbedBuilder from "./EmbedBuilder";
import db from "../modules/Database";
import { Time } from "./Functions";
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
		id: string;
		type: "warn";
	} | {
		blame: B;
		oldBlame: string;
		target: Eris.User | Eris.Member;
		reason?: string;
		id: string;
		type: "rmwarn" | "delwarn";
	} | {
		blame: B;
		target: Eris.User | Eris.Member;
		reason?: string;
		type: "hackban" | "kick" | "unban" | "unmute";
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
				embed
					.setTitle("{lang:other.modlog.titles.ban}")
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
				embed
					.setTitle("{lang:other.modlog.titles.mute}")
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.time}: ${!data.time ? "{lang:other.modlog.fields.permanent}" : Time.ms(data.time, true)}`
					].join("\n"));
				break;
			}

			case "hackban": {
				embed
					.setTitle("{lang:other.modlog.titles.hackban}")
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"));
				break;
			}

			case "kick": {
				embed
					.setTitle("{lang:other.modlog.titles.kick}")
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"));
				break;
			}

			case "softban": {
				embed
					.setTitle("{lang:other.modlog.titles.softban}")
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.deleteDays}: ${data.deleteDays}`
					].join("\n"));
				break;
			}

			case "unban": {
				embed
					.setTitle("{lang:other.modlog.titles.unban}")
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"));
				break;
			}

			case "unmute": {
				embed
					.setTitle("{lang:other.modlog.titles.unmute}")
					.setColor(Colors.green)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"));
				break;
			}

			case "warn": {
				embed
					.setTitle("{lang:other.modlog.titles.warn}")
					.setColor(Colors.gold)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`,
						`{lang:other.modlog.fields.id}: ${data.id}`
					].join("\n"));
				break;
			}

			case "rmwarn":
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

				embed
					.setTitle("{lang:other.modlog.titles.delwarn}")
					.setColor(Colors.gold)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.username}#${data.target.discriminator} <@!${data.target.id}>`,
						`{lang:other.modlog.fields.warningReason}: ${reason}`,
						`{lang:other.modlog.fields.oldBlame}: ${b}`,
						`{lang:other.modlog.fields.id}: ${data.id}`
					].join("\n"));
				break;
			}

			case "lock": {
				embed
					.setTitle("{lang:other.modlog.titles.lock}")
					.setColor(Colors.red)
					.setDescription([
						`{lang:other.modlog.fields.target}: ${data.target.name} <#${data.target.id}>`,
						`{lang:other.modlog.fields.reason}: ${reason}`
					].join("\n"));
				break;
			}

			case "unlock": {
				embed
					.setTitle("{lang:other.modlog.titles.unlock}")
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
			embed
		}).catch(err => null);
	}
}
