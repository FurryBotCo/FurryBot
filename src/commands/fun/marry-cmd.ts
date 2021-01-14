import Eris from "eris";
import config from "../../config";
import Command from "../../util/cmd/Command";
import db from "../../util/Database";
import EmbedBuilder from "../../util/EmbedBuilder";
import Request from "../../util/Functions/Request";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";
import Yiffy from "../../util/req/Yiffy";

export default new Command(["marry"], __filename)
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
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});
		const m = await db.getUser(member.id);

		if (msg.author.id === member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSelf`));
		if (member.bot) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noBot`));
		if (msg.uConfig.marriage) {
			const u = await this.getUser(msg.uConfig.marriage).then(res => `${res.username}#${res.discriminator}`).catch(err => "Unknown#0000");
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.selfAlreadyMarried`, [u]));
		}

		if (m.marriage) {
			if (m.marriage === msg.author.id) {
				await msg.uConfig.edit({
					marriage: m.id
				});
				const u = await this.getUser(msg.uConfig.marriage).then(res => `${res.username}#${res.discriminator}`).catch(err => "Unknown#0000");
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.selfAlreadyMarried`, [u]));
			}
			const u = await this.getUser(m.marriage).then(res => `${res.username}#${res.discriminator}`) || "Unknown#0000";
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.otherAlreadyMarried`, [u]));
		}

		const img = await Yiffy.furry.propose("json", 1);

		let d: Eris.Message<Eris.TextableChannel>;
		let force = false;
		if (msg.dashedArgs.value.includes("force")) {
			if (!config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.devOnly`));
			else force = true;
		}
		if (!force) {
			if (["embedLinks", "attachFiles"].some(p => msg.channel.permissionsOf(this.bot.user.id).has(p))) await msg.channel.createMessage({
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

			d = await this.col.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === member.id, 1);
			if (!d || !d.content) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noReply`));
		} else d = { content: "yes" } as any;
		if (["yes", "ye"].some(v => d.content.toLowerCase() === v)) {
			await msg.uConfig.edit({
				marriage: member.id
			}).then(d => d.reload());
			await m.edit({
				marriage: msg.author.id
			}).then(d => d.reload());
			return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.accepted`, [msg.author.id, member.id]));
		} else return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.denied`));
	});
