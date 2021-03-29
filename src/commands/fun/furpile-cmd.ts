import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Redis } from "../../db";
import { BotFunctions, Command, CommandError } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["furpile"], __filename)
	.setBotPermissions([
		"externalEmojis"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(5e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (Redis === null) throw new ReferenceError("Redis is not ready yet.");
		const k = `cmd:multiUser:furpile:${msg.channel.id}`;
		const h = await Redis.smembers(k);

		if (h.length !== 0) {
			if (h.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyPresent`));
			await Redis.sadd(k, msg.author.id);
			await Redis.pexpire(k, 18e5);
			h.push(msg.author.id);
			return msg.channel.createMessage({
				content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.join`, [msg.author.id, h.length - 1, h.length, msg.prefix]),
				allowedMentions: {
					users: false
				}
			});
		} else {
			if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
			const m = await msg.getMemberFromArgs();
			if (m === null) return msg.channel.createMessage({
				embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
			});
			if (m.id === msg.author.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSelf`));
			await Redis.sadd(k, msg.author.id, m.id);
			await Redis.pexpire(k, 18e5);
			await msg.channel.createMessage({
				content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.start`, [msg.author.id, m.id, msg.prefix]),
				allowedMentions: {
					users: false
				}
			});
		}
	});
