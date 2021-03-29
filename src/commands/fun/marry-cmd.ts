import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { db } from "../../db";
import Yiffy from "../../util/req/Yiffy";
import config from "../../config";
import { BotFunctions, Command, EmbedBuilder } from "core";
import Language from "language";
import Eris from "eris";
import { Request } from "utilities";

export default new Command<FurryBot, UserConfig, GuildConfig>(["marry"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const member = await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});
		const m = await db.getUser(member.id);

		if (msg.author.id === member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSelf`));
		if (member.bot) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBot`));
		if (msg.uConfig.marriage) {
			const u = await this.getUser(msg.uConfig.marriage).then(res => res === null ? "Unknown#0000" : `${res.username}#${res.discriminator}`).catch(() => "Unknown#0000");
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.selfAlreadyMarried`, [u]));
		}

		if (m.marriage && msg.uConfig.marriage !== null) {
			if (m.marriage === msg.author.id) {
				await msg.uConfig.edit({
					marriage: m.id
				});
				const u = await this.getUser(msg.uConfig.marriage).then(res => res === null ? "Unknown#0000" : `${res.username}#${res.discriminator}`).catch(() => "Unknown#0000");
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.selfAlreadyMarried`, [u]));
			}
			const u = await this.getUser(m.marriage).then(res => res === null ? "Unknown#0000" : `${res.username}#${res.discriminator}`) || "Unknown#0000";
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.otherAlreadyMarried`, [u]));
		}

		const img = await Yiffy.furry.propose("json", 1);

		let d: Eris.Message<Eris.TextableChannel> | null;
		let force = false;
		if (msg.dashedArgs.value.includes("force")) {
			if (!config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.devOnly`));
			else force = true;
		}
		if (!force) {
			if ((["embedLinks", "attachFiles"] as Array<ErisPermissions>).some(p => msg.channel.permissionsOf(this.bot.user.id).has(p))) await msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.title}`)
					.setDescription(`{lang:${cmd.lang}.text|${msg.author.id}|${member.id}}`)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setImage("attachment://marry.png")
					.setColor(Math.floor(Math.random() * 0xFFFFFF))
					.setTimestamp(new Date().toISOString())
					.toJSON(),
				content: Language.get(msg.gConfig.settings.lang, `${cmd.lang}.content`, [msg.author.id, member.id])
			}, {
				file: await Request.getImageFromURL(img.url),
				name: "marry.png"
			});
			else await msg.channel.createMessage(`${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.content`, [msg.author.id, member.id])} \n\n${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.imageTip`)} "`);

			d = await this.col.awaitMessages(msg.channel.id, 6e4, (v) => v.author.id === member.id, 1);
			if (!d || !d.content) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noReply`));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
		} else d = { content: "yes" } as any;
		if (["yes", "ye"].some(v => d!.content.toLowerCase() === v)) {
			await msg.uConfig.edit({
				marriage: member.id
			});
			await m.edit({
				marriage: msg.author.id
			});
			return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.accepted`, [msg.author.id, member.id]));
		} else return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.denied`));
	});
