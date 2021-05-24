import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { Command, CommandError } from "core";
import Language from "language";
import Eris from "eris";
import chunk from "chunk";

export default new Command<FurryBot, UserConfig, GuildConfig>(["purge", "prune"], __filename)
	.setBotPermissions([
		"manageMessages"
	])
	.setUserPermissions([
		"manageMessages"
	])
	.setRestrictions([])
	.setCooldown(1.5e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const count = Number(msg.args[0]);
		if (msg.args.length === 0 || isNaN(count)) throw new CommandError("INVALID_USAGE", cmd);
		if (count < 2 || count > 1000) return msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.amount`)}`);
		if (!msg.slash) await msg.delete();
		const m: Array<Eris.Message> = [];
		let i = count;
		while (i > 0) {
			const n = i > 100 ? 100 : i;
			i -= n;
			// eslint-disable-next-line deprecation/deprecation -- it's not deprecated, the eslint plugin is just dumb
			const s = await msg.channel.getMessages({
				limit: n,
				before: m.length === 0 ? undefined : m[m.length - 1].id
			});
			m.push(...s);
		}
		const b = m.filter(d => !(d.timestamp + 12096e5 < Date.now()));
		const f = b.filter(d => d.type !== 20);
		const del: Record<string, number> = {};
		for (const a of f) {
			if (!del[a.author.id]) del[a.author.id] = 0;
			del[a.author.id]++;
		}
		await msg.channel.startTyping();
		await Promise.all(chunk(f, 100).map(async (t) => msg.channel.deleteMessages(t.map(v => v.id), `Purge: ${msg.author.tag} (${msg.author.id})`)));
		await msg.channel.stopTyping();
		const t = [];
		for (const k of Object.keys(del)) {
			let u: Eris.Member | Eris.User | null = msg.channel.guild.members.get(k) || this.client.users.get(k) || await this.getUser(k).catch(() => null);
			if (u instanceof Eris.Member) u = u.user;
			if (u === null) {
				t.push(`**${k}**: ${del[k]}`);
				continue;
			} else {
				t.push(`**${u.tag}**: ${del[k]}`);
				continue;
			}
		}
		// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "purgeMessages", count, actual: f.length, timestamp: Date.now() });
		await msg.channel.createMessage(`${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [f.length])}\n\n${t.join("\n")}`);
		if (m.length !== b.length) await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.skipped`, [m.length - b.length]));
	});
