import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import Language from "../../util/Language";
import Eris from "eris";
import chunk from "chunk";

export default new Command(["prune", "purge"], __filename)
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
		if (msg.args.length === 0 || isNaN(count)) throw new CommandError("ERR_INVALID_USAGE", cmd);
		if (count < 2 || count > 1000) return msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.amount`)}`);
		await msg.delete();
		const m: Eris.Message[] = [];
		let i = count;
		while (i > 0) {
			const n = i > 100 ? 100 : i;
			i -= n;
			const s = await msg.channel.getMessages(n, m.length === 0 ? null : m[m.length - 1].id, null, null);
			m.push(...s);
		}
		const f = m.filter(d => !(d.timestamp + 12096e5 < Date.now()));
		const del = {};
		for (const a of f) {
			if (!del[a.author.id]) del[a.author.id] = 0;
			del[a.author.id]++;
		}
		await Promise.all(chunk(f, 100).map(async (t) => msg.channel.deleteMessages(t.map(m => m.id), encodeURIComponent(`Prune: ${msg.author.tag} (${msg.author.id})`))));
		const t = [];
		for (const k of Object.keys(del)) {
			let u: Eris.Member | Eris.User = msg.channel.guild.members.get(k) || this.bot.users.get(k) || await this.getUser(k).catch(err => null);
			if (u instanceof Eris.Member) u = u.user;
			if (!u) {
				t.push(`**${k}**: ${del[k]}`);
				continue;
			} else {
				t.push(`**${u.username}#${u.discriminator}**: ${del[k]}`);
				continue;
			}
		}
		// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "purgeMessages", count, actual: f.length, timestamp: Date.now() });
		await msg.channel.createMessage(`${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [f.length])}\n\n${t.join("\n")}`);
		if (m.length !== f.length) await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.skipped`, [m.length - f.length]));
	});
