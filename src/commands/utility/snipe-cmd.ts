import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import SnipeHandler from "../../util/handler/SnipeHandler";
import { Colors, Command, EmbedBuilder } from "core";
import Language from "language";
import { GuildTextableChannel } from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["snipe"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		let ch: GuildTextableChannel | null = null;
		if (msg.args.length > 0) ch = await msg.getChannelFromArgs();

		if (ch === null) ch = msg.channel;

		if (!ch.permissionsOf(msg.author.id).has("readMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.userCantSee`));
		if (!ch.permissionsOf(this.bot.user.id).has("readMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.selfCantSee`));

		const [l] = SnipeHandler.get("delete", ch.id);

		if (!l) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSnipes`, [ch.id]));
		/* const c = [
			{
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setDescription(`{lang:${cmd.lang}.expl}`)
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.furry)
					.toJSON()
			}
		] as Array<MessageContent>; */

		const m = l.content.match(new RegExp("((https?://)?(ptb.|canary.)?(discord((app)?.com/invite|.gg))/[a-zA-Z0-9]{1,15})", "gi"));
		if (m !== null) m.map(k => l.content = l.content.replace(new RegExp(k, "gi"), `[[INVITE]](${k})`));


		const u = await this.getUser(l.author);
		SnipeHandler.removeLast("delete", msg.channel.id);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setAuthor(`${u!.username}#${u!.discriminator}`, u!.avatarURL)
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
