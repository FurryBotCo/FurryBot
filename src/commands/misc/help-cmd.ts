import Command from "../../util/cmd/Command";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Language from "../../util/Language";

export default new Command(["help", "h"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) {
			const categories = this.cmd.categories.filter(cat => !(cat.restrictions.includes("beta") && !config.beta) && !(cat.restrictions.includes("developer") && !config.developers.includes(msg.author.id)));

			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle("{lang:other.words.help$ucwords$}")
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.random)
					.addFields(...categories.map(c => ({
						name: c.displayName || `{lang:categories.${c.name}.displayName}`,
						value: `\`${msg.prefix}help ${c.name}\`\n[{lang:${cmd.lang}.hoverInfo}](https://furry.bot '${c.description}\n${c.commands.length} {lang:other.words.total$ucwords$} {lang:other.words.commands$ucwords$}\n{lang:categories.${c.name}.description}')`,
						inline: true
					})))
					.toJSON()
			});
		} else {
			if (msg.args[0].toLowerCase() === "me") return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.helpMe`));

			const c = this.cmd.getCommand(msg.args[0].toLowerCase());
			const cat = this.cmd.getCategory(msg.args[0].toLowerCase());

			if (c.cmd && c.cat) {
				if (c.cmd.restrictions.includes("developer") && !config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.devOnlyCommand`));
				if (c.cat.restrictions.includes("developer") && !config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.devOnlyCategory`));
				const h = await c.cmd.runOverride("help", this, msg, c.cmd);
				if (h === "DEFAULT") await this.cmd.handlers.runHelp(this, msg, c.cmd);
			} else if (cat) {
				if (cat.restrictions.includes("developer") && !config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.devOnlyCategory`));
				const list = [];
				let i = 0;
				for (const t of cat.commands) {
					if (t.restrictions.includes("developer") && !config.developers.includes(msg.author.id)) continue;
					const v = cat.commands.length > 30 ? `\`${t.triggers[0]}\`${t.hasSlashVariant ? "**\\***" : ""} ` : `\`${t.triggers[0]}\`${t.hasSlashVariant ? "**\\***" : ""} - ${t.description || `{lang:commands.${t.category.name}.${t.triggers[0]}.description}`}\n`;
					if (!list[i]) list[i] = "";
					if (list[i].length + v.length > 1024) list[++i] = v;
					else list[i] += v;
				}

				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setTitle(cat.displayName || `{lang:categories.${cat.name}.displayName}`)
						.setDescription(`${cat.description || `{lang:categories.${cat.name}.description}`}\n\n{lang:${cmd.lang}.cmdCount|${cat.commands.length}}\n\n{lang:${cmd.lang}.slashTip|http${config.web.api.security ? "s" : ""}://${config.web.api.host}:${config.web.api.port}/note/slash}${cat.commands.length > 30 ? `\n\n{lang:${cmd.lang}.large}` : ""}`)
						.setColor(Math.floor(Math.random() * 0xFFFFFF))
						.setTimestamp(new Date().toISOString())
						.addFields(...list.map((l, i) => ({
							name: `{lang:${cmd.lang}.commandList|${i + 1}}`,
							value: l,
							inline: false
						})))
						.toJSON()
				});
			} else return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.neitherFound`));
		}
	});
