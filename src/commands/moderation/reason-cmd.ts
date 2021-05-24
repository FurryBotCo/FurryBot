import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { ModLogEntry }  from "../../util/@types/Database";
import db from "../../../src/db";
import { Command, CommandError } from "core";
import Language from "language";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["reason"], __filename)
	.setBotPermissions([
		"embedLinks",
		"manageMessages"
	])
	.setUserPermissions([
		"manageMessages"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 2) throw new CommandError("INVALID_USAGE", cmd);
		if (!msg.gConfig.modlog.enabled || msg.gConfig.modlog.webhook === null) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noModlog`));
		const id = Number(msg.args[0]);
		const reason = msg.args.slice(1).join(" ");
		if (reason.length > 200) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.tooLong`));
		const entries = await db.collection<ModLogEntry.GenericEntry>("modlog").find({ guildId: msg.channel.guild.id }).toArray();
		const entry = entries.find(e => e.pos === id);
		if (isNaN(id) || !entry) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidId`, [msg.args[0]]));
		if (!entry.messageId) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noMessage`, [msg.args[0]]));
		const ch = msg.channel.guild.channels.get(msg.gConfig.modlog.webhook.channelId) as Eris.GuildTextableChannel | undefined;
		if (!ch) {
			// we assume the modlog channel was deleted
			await msg.gConfig.mongoEdit({
				$set: {
					"modlog.webhook": null
				}
			});
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noModlog`));
		}
		const m = await ch.getMessage(entry.messageId).catch(() => null);
		if (!m) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.messageNotFound`));
		const r = Language.get(msg.gConfig.settings.lang, "other.modlog.fields.reason");
		let e: Eris.EmbedOptions | undefined, d: Array<string> | null, f: string | null;
		try {
			e = m.embeds.find(v => v.type === "rich");
			d = (e!.description ?? "").split("\n");
			f = d.find(v => v.indexOf(r) !== -1) ?? null;
		} catch (_) {
			d = null; f = null; // make the next section handle it for less duplication
		}

		if (!d || !f || !e) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.badlyFormed`));

		d[d.indexOf(f)] = `${r}: ${reason}`;
		e.description = d.join("\n");
		await this.client.editWebhookMessage(msg.gConfig.modlog.webhook.id, msg.gConfig.modlog.webhook.token, m.id, {
			embeds: [e]
		});

		await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.edited`, [id, reason]));
		if (msg.channel.permissionsOf(this.client.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(() => null);
	});
