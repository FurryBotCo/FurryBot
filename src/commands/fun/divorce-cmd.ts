import Command from "../../util/cmd/Command";
import db from "../../util/Database";
import Language from "../../util/Language";

export default new Command(["divorce"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (!msg.uConfig.marriage) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notMarried`));

		const m = await db.getUser(msg.uConfig.marriage);

		const u = await this.getUser(msg.uConfig.marriage).catch(err => ({ username: "Unknown", discriminator: "0000" }));
		await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.confirm`, [`${u.username}#${u.discriminator}`])).then(async () => {
			const d = await this.col.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id, 1);
			if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidOption`));
			if (d.content.toLowerCase() === "yes") {
				await msg.uConfig.edit({
					marriage: null
				}).then(d => d.reload());
				await m.edit({
					marriage: null
				}).then(d => d.reload());
				return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [`${u.username}#${u.discriminator}`]));
			} else return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.canceled`, [`${u.username}#${u.discriminator}`]));
		});
	});
