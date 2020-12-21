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

		let oldContent = await Redis.get(`snipe:edit:${ch.id}:oldContent`);
		let newContent = await Redis.get(`snipe:edit:${ch.id}:newContent`);
		const author = await Redis.get(`snipe:edit:${ch.id}:author`);
		const time = await Redis.get(`snipe:edit:${ch.id}:time`);

		if (!oldContent || !newContent || !author || !time) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSnipes`, [ch.id]));
		const i = newContent.match(new RegExp("((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
		const iN = oldContent.match(new RegExp("((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
		if (i) i.map(k => newContent = newContent.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));
		if (iN) iN.map(k => oldContent = oldContent.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));

		const u = await this.getUser(author);

		await Redis.del(`snipe:edit:${ch.id}:oldContent`);
		await Redis.del(`snipe:edit:${ch.id}:newContent`);
		await Redis.del(`snipe:edit:${ch.id}:author`);
		await Redis.del(`snipe:edit:${ch.id}:time`);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription(`{lang:${cmd.lang}.old}: ${oldContent}\n{lang:${cmd.lang}.new}: ${newContent}`)
				.setAuthor(`${u.username}#${u.discriminator}`, u.avatarURL)
				.setTimestamp(new Date(Number(time)).toISOString())
				.setColor(Colors.gold)
				.toJSON()
		});
	});
