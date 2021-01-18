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

		const [c, author, time, r] = await Redis.mget(
			`snipe:delete:${ch.id}:content`,
			`snipe:delete:${ch.id}:author`,
			`snipe:delete:${ch.id}:time`,
			`snipe:delete:${ch.id}:ref`
		);
		const ref: {
			link: string;
			author: string;
			content: string;
		} | null = r ? JSON.parse(r) : null;
		// need to be able to edit;
		let content = c;

		if (!content || !author || !time) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSnipes`, [ch.id]));

		const i = content.match(new RegExp("((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
		if (i) i.map(k => content = content.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));
		const u = await this.getUser(author);


		await Redis.del(
			`snipe:delete:${ch.id}:content`,
			`snipe:delete:${ch.id}:author`,
			`snipe:delete:${ch.id}:time`,
			`snipe:delete:${ch.id}:ref`,
		);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setAuthor(`${u.username}#${u.discriminator}`, `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`)
				.setDescription([
					c,
					...(ref ? [
						"",
						`{lang:${cmd.lang}.reply|${ref.author}|${ref.link}}`,
						`> ${ref.content.slice(0, 40)}${ref.content.length > 40 ? " (...)" : ""}`
					] : [])
				].join("\n"))
				.setTimestamp(new Date(Number(time)).toISOString())
				.setColor(Colors.red)
				.toJSON()
		});
	});
