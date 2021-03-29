import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { db } from "../../db";
import { Command } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["divorce"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.uConfig.marriage === null) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notMarried`));

		const m = await db.getUser(msg.uConfig.marriage);

		const u = await this.getUser(msg.uConfig.marriage).catch(() => ({ username: "Unknown", discriminator: "0000" }));
		if (u === null) {
			await msg.uConfig.edit({
				marriage: null
			});
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notMarried`));
		}
		await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.confirm`, [`${u.username}#${u.discriminator}`])).then(async () => {
			const d = await this.col.awaitMessages(msg.channel.id, 6e4, (v) => v.author.id === msg.author.id, 1);
			if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidOption`));
			if (d.content.toLowerCase() === "yes") {
				await msg.uConfig.edit({
					marriage: null
				});
				await m.edit({
					marriage: null
				});
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [`${u.username}#${u.discriminator}`]));
			} else return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.canceled`, [`${u.username}#${u.discriminator}`]));
		});
	});
