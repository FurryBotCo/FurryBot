import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import SnipeHandler from "../../util/handler/SnipeHandler";
import { Colors, Command, EmbedBuilder } from "core";
import Eris from "eris";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["editsnipe", "esnipe", "es"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		let ch: Eris.GuildTextableChannel | null = null;
		if (msg.args.length > 0) ch = await msg.getChannelFromArgs();

		if (ch === null) ch = msg.channel;

		if (!ch.permissionsOf(msg.author.id).has("viewChannel")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.userCantSee`));
		if (!ch.permissionsOf(this.client.user.id).has("viewChannel")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.selfCantSee`));

		const [l] = SnipeHandler.get("edit", ch.id);

		if (!l) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSnipes`, [ch.id]));
		const i = /((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})/gi.exec(l.newContent);
		const iN = /((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})/gi.exec(l.oldContent);
		if (i) i.map(k => l.newContent = l.newContent.replace(new RegExp(k, "gi"), `[\\[INVITE\\]](${k})`));
		if (iN) iN.map(k => l.oldContent = l.oldContent.replace(new RegExp(k, "gi"), `[\\[INVITE\\]](${k})`));

		const u = await this.getUser(l.author).catch(() => null).then(v => v === null ? ({ tag: "Unknown#0000", avatarURL: "https://i.furry.bot/noicon.png" }) : v);
		SnipeHandler.removeLast("edit", ch.id);
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setAuthor(`${u.tag}`, u.avatarURL)
				.setTimestamp(l.time)
				.setColor(Colors.gold)
				.addField(`{lang:${cmd.lang}.old}`, l.oldContent, false)
				.addField(`{lang:${cmd.lang}.new}`, l.newContent, false)
				.toJSON()
		});
	});
