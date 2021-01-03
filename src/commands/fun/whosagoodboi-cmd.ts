import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import db from "../../util/Database";
import EmbedBuilder from "../../util/EmbedBuilder";
import Internal from "../../util/Functions/Internal";

export default new Command(["whosagoodboi", "whosagoodboy", "goodboi", "goodboy"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const u = await msg.getUserFromArgs();
		const naughtyList = [
			"608483791832481813",
			"777702082357624874"
		];
		if (u) {
			const c = await db.checkBl("user", u.id);
			if (c.current.length > 0) naughtyList.push(u.id);
		}
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setDescription(`{lang:${cmd.lang}.${msg.args.length === 0 ? "me" : "other"}${[u?.id, msg.author.id].some(v => naughtyList.includes(v)) ? "Bad" : ""}|${Internal.extraArgParsing(msg)}}`)
				.setTimestamp(new Date().toISOString())
				.setFooter("OwO", this.bot.user.avatarURL)
				.setColor(Colors.gold)
				.toJSON()
		});
	});
