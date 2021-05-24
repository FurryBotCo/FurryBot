import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Colors, Command, EmbedBuilder } from "core";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["bancount"], __filename)
	.setBotPermissions([
		"viewAuditLog"
	])
	.setUserPermissions([
		"viewAuditLog"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const b: Array<Eris.GuildAuditLogEntry> = [];

		async function get(a?: string): Promise<undefined> {
			const { entries } = await msg.channel.guild.getAuditLog({
				limit: 100,
				before: a,
				actionType: Eris.Constants.AuditLogActions.MEMBER_BAN_ADD
			});

			b.push(...entries);
			if (entries.length === 100) return get(entries[99].id);
			else return;
		}

		await get();

		const k: Record<string, number> = {};

		b.map(e => k[e.user.id] = (k[e.user.id] ?? 0) + 1);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.total}: ${b.length}`)
				.setDescription(Object.keys(k).map(j => `<@!${j}>: ${k[j]}`).join("\n"))
				.setColor(Colors.furry)
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});
	});
