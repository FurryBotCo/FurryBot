import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import Language from "../../util/Language";
import chunk from "chunk";

export default new Command(["lsar"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const page = msg.args.length > 0 ? parseInt(msg.args[0], 10) : 1;
		if (msg.gConfig.selfAssignableRoles.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noRoles`));
		const c = chunk(msg.gConfig.selfAssignableRoles, 10);
		if (c.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noRoles`));
		if (!page || page > c.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidPage`));
		const remove: string[] = [];
		const rl = msg.gConfig.selfAssignableRoles.map(a => {
			const b = msg.channel.guild.roles.get(a);
			if (!b) {
				remove.push(a);
				return `{lang:${cmd.lang}.notFound} - \`${a}\``;
			}
			return b.name;
		}).join("\n");
		if (remove.length > 0) await msg.gConfig.mongoEdit({ $pullAll: { selfAssignableRoles: remove } });

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription(`{lang:${cmd.lang}.desc|${msg.gConfig.settings.prefix}|${page}|${c.length}}`)
				.addField(`{lang:${cmd.lang}.roles}`, rl, false)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		});
	});
