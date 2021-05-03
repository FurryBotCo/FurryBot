import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import { Redis } from "../../db";
import { Command } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["awoo"], __filename)
	.setBotPermissions([
		"embedLinks",
		"externalEmojis"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(5e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (Redis === null) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.redisNotReady"));
		const k = `cmd:multiUser:awoo:${msg.channel.id}`;
		const h = await Redis.smembers(k);

		if (h.length !== 0) {
			if (h.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyPresent`));
			await Redis.sadd(k, msg.author.id);
			await Redis.pexpire(k, 18e5);
			return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.join`, [msg.author.id, h.length, msg.prefix, h.length > 30 ? Language.get(msg.gConfig.settings.lang, `${cmd.lang}.tooLarge`) : `<:${config.emojis.custom.awoo}>`.repeat(h.length)]));
		} else {
			await Redis.sadd(k, msg.author.id);
			await Redis.pexpire(k, 18e5);
			await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.start`, [msg.author.id, msg.prefix, `<:${config.emojis.custom.awoo}>`]));
		}
	});
