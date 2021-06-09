import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import db from "../../db";
const { r: Redis } = db;
import { Colors, Command, EmbedBuilder } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["afk"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (Redis === null) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.redisNotReady"));
		await Redis.set(`afk:servers:${msg.channel.guild.id}:${msg.author.id}`, JSON.stringify({
			time: Date.now(),
			message: msg.args.join(" ")
		}));
		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription(`{lang:${cmd.lang}.done${msg.args.length === 0 ? "Message" : ""}|${msg.args.join(" ")}}`)
				.setTimestamp(new Date().toISOString())
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("OwO", this.client.user.avatarURL)
				.setColor(Colors.furry)
				.toJSON()
		});
	});
