import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import db from "../../db";
import { BotFunctions, Colors, Command, EmbedBuilder } from "core";

export default new Command<FurryBot, UserConfig, GuildConfig>(["whosagoodboi", "whosagoodboy", "goodboi", "goodboy"], __filename)
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
				.setDescription(`{lang:${cmd.lang}.${msg.args.length === 0 ? "self" : u && u.id === this.client.user.id ? "me" : "other"}${((u && naughtyList.includes(u.id)) || (naughtyList.includes(msg.author.id))) ? "Bad" : ""}|${BotFunctions.extraArgParsing(msg)}}`)
				.setTimestamp(new Date().toISOString())
				.setFooter("OwO", this.client.user.avatarURL)
				.setColor(Colors.furry)
				.toJSON()
		});
	});
