import Eris from "eris";
import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Internal from "../../util/Functions/Internal";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";

export default new Command(["bancount"], __filename)
	.setBotPermissions([
		"viewAuditLogs"
	])
	.setUserPermissions([
		"viewAuditLogs"
	])
	.setRestrictions([])
	.setCooldown(3e4, true)
	.setExecutor(async function (msg, cmd) {
		const b: Eris.GuildAuditLogEntry[] = [];

		async function get(a?: string) {
			const { entries } = await msg.channel.guild.getAuditLogs(100, a || null, Eris.Constants.AuditLogActions.MEMBER_BAN_ADD);

			b.push(...entries);
			if (entries.length === 100) return get(entries[99].id);
			else return;
		}

		await get(null);

		const k = {};

		b.map(e => !k[e.user.id] ? k[e.user.id] = 1 : k[e.user.id]++);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.total}: ${b.length}`)
				.setDescription(Object.keys(k).map(j => `<@!${j}>: ${k[j]}`).join("\n"))
				.setColor(Colors.green)
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});
	});
