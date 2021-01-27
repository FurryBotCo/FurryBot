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

		const [l] = this.sn.get("delete", ch.id);

		if (!l) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSnipes`, [ch.id]));
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

		const m = l.content.match(new RegExp("((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
		if (m !== null) m.map(k => l.content = l.content.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));



		const u = await this.getUser(l.author);
		this.sn.removeLast("delete", msg.channel.id);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setAuthor(`${u.username}#${u.discriminator}`, u.avatarURL)
				.setDescription([
					`${l.content.slice(0, 250)}${l.content.length > 250 ? " (...)" : ""}`,
					...(l.ref ? [
						"",
						`{lang:${cmd.lang}.reply|${l.ref.author}|${l.ref.link}}`,
						`> ${l.ref.content.slice(0, 40)}${l.ref.content.length > 40 ? " (...)" : ""}`
					] : [])
				].join("\n"))
				.setTimestamp(l.time)
				.setColor(Colors.red)
				.setFooter(`{lang:${cmd.lang}.footer}`)
				.toJSON()
		});
	});
