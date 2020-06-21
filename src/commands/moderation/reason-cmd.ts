import Command from "../../modules/CommandHandler/Command";
import Eris from "eris";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Time, Utility } from "../../util/Functions";
import Language from "../../util/Language";
import { mdb } from "../../modules/Database";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"reason"
	],
	permissions: {
		user: [
			"manageMessages"
		],
		bot: []
	},
	cooldown: 2e3,
	donatorCooldown: 2e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 2) throw new CommandError("ERR_INVALID_USAGE", cmd);
	if (!gConfig.settings.modlog || !msg.channel.guild.channels.has(gConfig.settings.modlog)) return msg.reply("{lang:commands.moderation.reason.noModlog}");
	const id = Number(msg.args[0]);
	const reason = msg.args.slice(1).join(" ");
	if (reason.length > 200) return msg.reply("{lang:commands.moderation.reason.tooLong}");
	const entries = await mdb.collection<ModLogEntry.GenericEntry>("modlog").find({ guildId: msg.channel.guild.id }).toArray();
	const entry = entries.find(e => e.pos === id);
	if (isNaN(id) || !entry) return msg.reply(`{lang:commands.moderation.reason.invalidId|${msg.args[0]}}`);
	if (!entry.messageId) return msg.reply(`{lang:commands.moderation.reason.noMessage|${msg.args[0]}}`);
	const m = await msg.channel.guild.channels.get<Eris.GuildTextableChannel>(gConfig.settings.modlog).getMessage(entry.messageId);
	if (!m) return msg.reply("{lang:commands.moderation.reason.messageNotFound}");
	const r = Language.get(gConfig.settings.lang, "other.modlog.fields.reason", false);
	let e: Eris.EmbedOptions, d: string[], f: string;
	try {
		e = m.embeds.find(e => e.type === "rich");
		d = e.description.split("\n");
		f = d.find(v => v.indexOf(r) !== -1);
	} catch (e) {
		d = null; f = null; // make the next section handle it for less duplication
	}

	if (!d || !f) return msg.reply("{lang:commands.moderation.reason.badlyFormed}");

	d[d.indexOf(f)] = `${r}: ${reason}`;
	e.description = d.join("\n");
	await m.edit({
		embed: e
	});

	return msg.reply(`{lang:commands.moderation.reason.edited|${id}|${reason}}`);
}));
