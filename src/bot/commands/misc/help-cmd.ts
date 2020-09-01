import Command from "../../../util/cmd/Command";
import config from "../../../config";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import Language from "../../../util/Language";

export default new Command(["help", "h"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) {
			const categories = [...this.cmd.categories];

			for (const cat of categories) {
				if (cat.restrictions.includes("beta") && !config.beta) categories.splice(categories.indexOf(cat), 1);
				if (cat.restrictions.includes("developer") && !config.developers.includes(msg.author.id)) categories.splice(categories.indexOf(cat), 1);
			}

			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle("{lang:other.words.help$ucwords$}")
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTimestamp(new Date().toISOString())
					.setColor(Colors.random)
					.addFields(...categories.map(c => ({
						name: c.displayName || `{lang:categories.${c.name}.displayName}`,
						value: `\`${msg.gConfig.settings.prefix}help ${c.name}\`\n[{lang:${cmd.lang}.hoverInfo}](https://furry.bot '${c.description}\n${c.commands.length} {lang:other.words.total$ucwords$} {lang:other.words.commands$ucwords$}\n{lang:categories.${c.name}.description}')`,
						inline: true
					})))
					.toJSON()
			});
		} else {
			if (msg.args[0].toLowerCase() === "me") return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}`));

			const c = this.cmd.getCommand(msg.args[0]);
			const cat = this.cmd.getCategory(msg.args[0]);

			if (c.cmd && c.cat) {
				console.log("command");
				const h = await c.cmd.runOverride("help", this, msg, c.cmd);
				if (h === "DEFAULT") await this.cmd.handlers.runHelp(this, msg, c.cmd);
			} else if (cat) {
				const list = [];
				let i = 0;
				for (const t of cat.commands) {
					const v = `\`${t.triggers[0]}\` - ${t.description || `{lang:commands.${t.category.name}.${t.triggers[0]}.description}`}`;
					if (!list[i]) list[i] = "";
					if (list[i].length + v.length > 1024) list[++i] = `${v}\n`;
					else list[i] += `${v}\n`;
				}

				return msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setTitle(cat.displayName || `{lang:categories.${cat.name}.displayName}`)
						.setDescription(`${cat.description || `{lang:categories.${cat.name}.description}`}\n\n{lang:${cmd.lang}.cmdCount|${cat.commands.length}}`)
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
