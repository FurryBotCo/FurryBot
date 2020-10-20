import Command from "../../util/cmd/Command";
import Language from "../../util/Language";
import Eris from "eris";
import CommandError from "../../util/cmd/CommandError";
import { mdb } from "../../util/Database";

export default new Command(["reason"], __filename)
	.setBotPermissions([
		"embedLinks",
		"manageMessages"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 2) throw new CommandError("ERR_INVALID_USAGE", cmd);
		if (!msg.gConfig.modlog.enabled || !msg.channel.guild.channels.has(msg.gConfig.modlog.channel)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noModlog`));
		const id = Number(msg.args[0]);
		const reason = msg.args.slice(1).join(" ");
		if (reason.length > 200) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.tooLong`));
		const entries = await mdb.collection<ModLogEntry.GenericEntry>("modlog").find({ guildId: msg.channel.guild.id }).toArray();
		const entry = entries.find(e => e.pos === id);
		if (isNaN(id) || !entry) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidId`, [msg.args[0]]));
		if (!entry.messageId) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noMessage`, [msg.args[0]]));
		const m = await (msg.channel.guild.channels.get(msg.gConfig.modlog.channel) as Eris.GuildTextableChannel).getMessage(entry.messageId);
		if (!m) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.messageNotFound`));
		const r = Language.get(msg.gConfig.settings.lang, "other.modlog.fields.reason");
		let e: Eris.EmbedOptions, d: string[], f: string;
		try {
			e = m.embeds.find(e => e.type === "rich");
			d = e.description.split("\n");
			f = d.find(v => v.indexOf(r) !== -1);
		} catch (e) {
			d = null; f = null; // make the next section handle it for less duplication
		}

		if (!d || !f) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.badlyFormed`));

		d[d.indexOf(f)] = `${r}: ${reason}`;
		e.description = d.join("\n");
		await m.edit({
			embed: e
		});

		await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.edited`, [id, reason]));
		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(err => null);
	});
