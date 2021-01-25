import Eris from "eris";
import config from "../../config";
import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Language from "../../util/Language";
import Redis from "../../util/Redis";

export default new Command(["editsnipe", "esnipe", "es"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		let ch: Eris.TextChannel;
		if (msg.args.length > 0) ch = await msg.getChannelFromArgs();

		if (!ch) ch = msg.channel;

		if (!ch.permissionsOf(msg.author.id).has("readMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.userCantSee`));
		if (!ch.permissionsOf(this.bot.user.id).has("readMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.selfCantSee`));

		const [l] = this.sn.get("edit", ch.id);

		if (!l) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSnipes`, [ch.id]));
		const i = l.newContent.match(new RegExp("((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
		const iN = l.oldContent.match(new RegExp("((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
		if (i) i.map(k => l.newContent = l.newContent.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));
		if (iN) iN.map(k => l.oldContent = l.oldContent.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));

		const u = await this.getUser(l.author);
		this.sn.removeLast("edit", ch.id);
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setAuthor(`${u.username}#${u.discriminator}`, u.avatarURL)
				.setTimestamp(l.time)
				.setColor(Colors.gold)
				.addField(`{lang:${cmd.lang}.old}`, l.oldContent, false)
				.addField(`{lang:${cmd.lang}.new}`, l.newContent, false)
				.toJSON()
		});
	});
