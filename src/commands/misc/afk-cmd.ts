import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { Redis } from "../../db";
import { Colors, Command, EmbedBuilder } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["afk"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (Redis === null) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.redisNotReady"));
		const type = msg.args.length === 0 || msg.args[0].toLowerCase() !== "global" ? "server" : "global";
		await Redis.set(`afk:${type === "server" ? `servers:${msg.channel.guild.id}` : "global"}:${msg.author.id}`, Date.now());
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title${type === "global" ? "Global" : ""}}`)
				.setDescription(`{lang:${cmd.lang}.done${type === "global" ? "Global" : ""}}`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("OwO", this.bot.user.avatarURL)
				.setColor(Colors.furry)
				.toJSON()
		});
	});
