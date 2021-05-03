import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { Command } from "core";
import Language from "language";
import Eris from "eris";
import Logger from "logger";

export default new Command<FurryBot, UserConfig, GuildConfig>(["setup-mutes"], __filename)
	.setBotPermissions([
		"embedLinks",
		"manageChannels"
	])
	.setUserPermissions([
		"kickMembers",
		"manageChannels"
	])
	.setRestrictions([])
	.setCooldown(1.5e4, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (!msg.gConfig.settings.muteRole) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noRole`, [msg.prefix]));
		const cm = new Map<string, Record<string, [allow: bigint, deny: bigint]>>();
		for (const [, ch] of msg.channel.guild.channels) {
			try {
				const a = ch.permissionOverwrites.get(msg.channel.guild.id);
				const b = ch.permissionOverwrites.get(msg.gConfig.settings.muteRole);
				const o = {} as Record<string, [allow: bigint, deny: bigint]>;
				if (a && a.allow & Eris.Constants.Permissions.sendMessages) o[msg.channel.guild.id] = [a.allow - Eris.Constants.Permissions.sendMessages, a.deny];
				if (b && b.allow & Eris.Constants.Permissions.sendMessages) o[msg.gConfig.settings.muteRole] = [b.allow - Eris.Constants.Permissions.sendMessages, b.deny];
				if (b && !(b.deny & Eris.Constants.Permissions.sendMessages)) o[msg.gConfig.settings.muteRole] = [!o[msg.gConfig.settings.muteRole] ? b.allow : o[msg.gConfig.settings.muteRole][0], b.deny + Eris.Constants.Permissions.sendMessages];
				if (!b || b?.deny === 0n) o[msg.gConfig.settings.muteRole] = [!o[msg.gConfig.settings.muteRole] ? 0n : o[msg.gConfig.settings.muteRole][0], Eris.Constants.Permissions.sendMessages];
				/* if (c || !b || b?.deny === 0n) {
					await ch.editPermission(msg.gConfig.settings.muteRole, b?.allow || 0n, b?.deny || Eris.Constants.Permissions.sendMessages, "role", `Setup-Mutes: ${msg.author.tag} (${msg.author.id})`);
					n++;
				} */
				if (Object.keys(o).length !== 0) cm.set(ch.id, o);
			} catch (err) {
				Logger.error(`SetupMutes[${msg.channel.guild.id}/${msg.author.id}]`, err);
			}
		}

		let m: Eris.Message<Eris.TextableChannel> | null;
		const e = await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.confirm${cm.size === 1 ? "One" : ""}`, [cm.size]));
		if (!msg.dashedArgs.value.includes("yes")) {
			m = await this.col.awaitMessages(msg.channel.id, 6e4, (v) => v.author.id === msg.author.id, 1);
			if (m) await m.delete().catch(() => null);
		} else m = {
			content: "yes"
		} as Eris.Message;
		console.log(m, m?.content.toLowerCase());
		if (!m?.content || !["yes", "y"].includes(m.content.toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.canceled`));
		if (cm.size === 0) return e.edit(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.none`));
		await e.edit(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.inProgress${cm.size === 1 ? "One" : ""}`, [cm.size]));
		for (const [id, list] of cm) {
			const ch = msg.channel.guild.channels.get(id)!;
			const k = Object.keys(list);
			for (const c of k) {
				const [a, d] = list[c];
				await ch.editPermission(c, a, d, "role", `Setup-Mutes: ${msg.author.tag} (${msg.author.id})`);
			}
		}
		await e.edit(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done${cm.size === 1 ? "One" : ""}`, [cm.size]));
	});
