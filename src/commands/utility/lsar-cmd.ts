import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { Command, EmbedBuilder } from "core";
import Language from "language";
import chunk from "chunk";

export default new Command<FurryBot, UserConfig, GuildConfig>(["lsar"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		const page = msg.args.length > 0 ? parseInt(msg.args[0], 10) : 1;
		if (msg.gConfig.selfAssignableRoles.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noRoles`));
		const c = chunk(msg.gConfig.selfAssignableRoles, 10);
		if (c.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noRoles`));
		if (!page || page > c.length) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidPage`));
		const remove: Array<string> = [];
		const rl = msg.gConfig.selfAssignableRoles.map(a => {
			const b = msg.channel.guild.roles.get(a);
			if (!b) {
				remove.push(a);
				return `{lang:${cmd.lang}.notFound} - \`${a}\``;
			}
			return `<@&${a}>`;
		}).join("\n");
		if (remove.length > 0) await msg.gConfig.mongoEdit({ $pullAll: { selfAssignableRoles: remove } });

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription(`{lang:${cmd.lang}.desc|${msg.prefix}|${page}|${c.length}}`)
				.addField(`{lang:${cmd.lang}.roles}`, rl, false)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()/* ,
			components: chunk(msg.gConfig.selfAssignableRoles).map(s => ({
				type: 1,
				components: s.map(v => ({
					type: 2,
					custom_id: `addrole_${v}`,
					style: 1,
					label: msg.channel.guild.roles.get(v)!.name
				}))
			})) */
			// these are too clunky right now
		});
	});
