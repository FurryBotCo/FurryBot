import Eris from "eris";
import config from "../../config";
import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Language from "../../util/Language";
import Redis from "../../util/Redis";

export default new Command(["snipe"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		let ch: Eris.TextChannel;
		if (msg.args.length > 0) ch = await msg.getChannelFromArgs();

		if (!ch) ch = msg.channel;

		if (!ch.permissionsOf(msg.author.id).has("readMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.userCantSee`));
		if (!ch.permissionsOf(this.bot.user.id).has("readMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.selfCantSee`));

		const l = this.sn.get("delete", ch.id);

		if (l.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSnipes`, [ch.id]));
		const c: Eris.MessageContent[] = [
			{
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setDescription(`{lang:${cmd.lang}.expl}`)
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.gold)
					.toJSON()
			}
		];

		for (const { content, author, time, ref } of l) {
			const i = l.indexOf(l.find(v => v.content === content));
			let ct = content;
			const m = content.match(new RegExp("((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
			if (m !== null) m.map(k => ct = ct.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));
			const a = await this.getUser(author);
			c.push({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title|${i + 1}}`)
					.setAuthor(`${a.username}#${a.discriminator}`, `https://cdn.discordapp.com/avatars/${a.id}/${a.avatar}.png`)
					.setDescription([
						`${ct.slice(0, 250)}${ct.length > 250 ? " (...)" : ""}`,
						...(ref ? [
							"",
							`{lang:${cmd.lang}.reply|${ref.author}|${ref.link}}`,
							`> ${ref.content.slice(0, 40)}${ref.content.length > 40 ? " (...)" : ""}`
						] : [])
					].join("\n"))
					.setTimestamp(time)
					.setColor(Colors.red)
					.toJSON()
			});
		}


		this.sn.removeAll("delete", msg.channel.id);

		return Promise.all(c.map(async (m) => msg.channel.createMessage(m)));
	});
