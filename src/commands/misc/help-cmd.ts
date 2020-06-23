import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import config from "../../config";
import { Time } from "../../util/Functions";
import Language from "../../util/Language";

export default new Command({
	triggers: [
		"help"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks",
			"attachFiles"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) {
		const categories = [...this.cmd.categories];

		categories.map(c => {
			if ((c.restrictions.includes("developer") && !config.developers.includes(msg.author.id))) categories.splice(categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()), categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()));
		});

		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.misc.help.title}")
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.addFields(...categories.map(c => ({
					name: `${c.displayName}`,
					value: `\`${gConfig.settings.prefix}help ${c.name}\`\n[{lang:commands.misc.help.hoverInfo}](https://furry.bot '${c.description}\n${c.commands.length} {lang:commands.misc.help.cmdTotal}')`,
					inline: true
				})))
				.toJSON()
		});
	}

	if (this.cmd.triggers.includes(msg.args[0].toLowerCase())) {
		const { cat, cmd } = this.cmd.getCommand(msg.args[0].toLowerCase());

		if (!cmd) return msg.reply("{lang:commands.misc.help.cmdNotFound}");

		if (cmd.restrictions.includes("developer") && !(config.developers.includes(msg.author.id) || config.contributors.includes(msg.author.id))) return msg.reply("you must be a developer / contributor to see this command.");

		if (cmd.restrictions.includes("helper") && !config.helpers.includes(msg.author.id)) return msg.reply("you must be a helper or above to see this command.");
		const u = Language.get(gConfig.settings.lang, `commands.${cat.name}.${cmd.triggers[0]}.usage`);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle(cmd.triggers[0])
				.setDescription([
					cmd.description,
					"",
					`**{lang:other.words.restrictions}**:`,
					`{lang:commands.misc.help.embed.restrictionsTip}`,
					"```diff",
					...this.cmd.restrictions.map(r => `${cmd.restrictions.includes(r.name as any) ? "+" : "-"} {lang:other.commandRestrictions.${r.name}}`),
					"```",
					"",
					`**{lang:other.words.permissions}**:`,
					`\u25FD {lang:other.words.bot}: **${cmd.permissions.bot.length === 0 ? "{lang:other.words.none}" : cmd.permissions.bot.join("**, **")}**`,
					`\u25FD {lang:other.words.user}: **${cmd.permissions.user.length === 0 ? "{lang:other.words.none}" : cmd.permissions.user.join("**, **")}**`,
					"",
					"**{lang:other.words.extra}**:",
					`\u25FD {lang:other.words.usage}: \`${gConfig.settings.prefix}${cmd.triggers[0]}${!u ? !cmd.usage ? "" : ` ${cmd.usage}` : ` ${u}`}\``,
					`\u25FD {lang:other.words.aliases}: ${cmd.triggers.join(", ")}`,
					`\u25FD {lang:commands.misc.help.embed.normalCooldown}: ${Time.ms(cmd.cooldown, true)}`,
					`\u25FD {lang:commands.misc.help.embed.donatorCooldown}: ${Time.ms(cmd.donatorCooldown, true)}`,
					`\u25FD {lang:other.words.category}: ${cat.displayName}`
				].join("\n"))
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.toJSON()
		});
	}

	if (this.cmd.categories.map(c => c.name.toLowerCase()).includes(msg.args[0].toLowerCase())) {
		const cat = this.cmd.getCategory(msg.args[0]);

		if (!cat) return msg.reply("{lang:commands.misc.help.catNotFound}");

		if (cat.restrictions.includes("developer") && !config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.misc.help.devOnlyCat}");

		const fields: {
			name: string;
			value: string;
			inline: boolean;
		}[] = [];

		let i = 0;
		cat.commands.map(c => {
			if (!(c.restrictions.includes("developer") && !config.developers.includes(msg.author.id))) {
				if (!fields[i]) fields[i] = {
					name: `{lang:commands.misc.help.cmdList|${i + 1}}`,
					value: "",
					inline: false
				};

				const txt = `\`${c.triggers[0]}\` - ${c.description}`;

				if (fields[i].value.length > 1000 || fields[i].value.length + txt.length > 1000) {
					i++;
					return fields[i] = {
						name: `{lang:commands.misc.help.cmdList|${i + 1}}`,
						value: txt,
						inline: false
					};
				} else {
					return fields[i].value = `${fields[i].value}\n${txt}`;
				}
			}
		});

		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle(cat.displayName)
				.setDescription(cat.description)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.addFields(...fields)
				.toJSON()
		});
	}

	return msg.reply("{lang:commands.misc.help.neitherFound}");
}));
