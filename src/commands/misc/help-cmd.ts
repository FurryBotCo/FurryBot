import Command from "../../util/CommandHandler/lib/Command";
import Eris from "eris";
import EmbedBuilder from "../../util/EmbedBuilder";
import config from "../../config";
import { Time } from "../../util/Functions";

export default new Command({
	triggers: [
		"help"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) {
		const categories = [...this.cmd.categories];

		categories.forEach((c) => {
			if ((c.devOnly && !config.developers.includes(msg.author.id))) categories.splice(categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()), categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()));
		});

		const embed = new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.misc.help.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF));

		categories.map(c => embed.addField(`${c.displayName}`, `\`${gConfig.settings.prefix}help ${c.name}\`\n[{lang:commands.misc.help.hoverInfo}](https://furry.bot '${c.description}\n${c.commands.length} {lang:commands.misc.help.cmdTotal}')`, true));

		return msg.channel.createMessage({
			embed
		});
	}

	if (this.cmd.commandTriggers.includes(msg.args[0].toLowerCase())) {
		const { cat, cmd } = this.cmd.getCommand(msg.args[0].toLowerCase());

		if (!cmd) return msg.reply("{lang:commands.misc.help.cmdNotFound}");

		if (cmd.features.includes("devOnly") && !config.developers.includes(msg.author.id)) return msg.reply("you must be a developer to see this command.");

		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle(cmd.triggers[0])
				.setDescription([
					cmd.description,
					"",
					`**{lang:commands.misc.help.restrictions}**:`,
					`\u25FD {lang:commands.misc.help.nsfw}: **${cmd.features.includes("nsfw") ? "{lang:commands.misc.help.yes}" : "{lang:commands.misc.help.no}"}**`,
					`\u25FD {lang:commands.misc.help.devOnly}: **${cmd.features.includes("devOnly") ? "{lang:commands.misc.help.yes}" : "{lang:commands.misc.help.no}"}**`,
					`\u25FD {lang:commands.misc.help.betaOnly}: **${cmd.features.includes("betaOnly") ? "{lang:commands.misc.help.yes}" : "{lang:commands.misc.help.no}"}**`,
					`\u25FD {lang:commands.misc.help.guildOwnerOnly}: **${cmd.features.includes("guildOwnerOnly") ? "{lang:commands.misc.help.yes}" : "{lang:commands.misc.help.no}"}**`,
					`\u25FD {lang:commands.misc.help.supportServerOnly}: **${cmd.features.includes("supportOnly") ? "{lang:commands.misc.help.yes}" : "{lang:commands.misc.help.no}"}**`,
					`\u25FD {lang:commands.misc.help.donatorOnly}: **${cmd.features.includes("donatorOnly") ? "{lang:commands.misc.help.yes}" : "{lang:commands.misc.help.no}"}**`,
					`\u25FD {lang:commands.misc.help.premiumGuildOnly}: **${cmd.features.includes("premiumGuildOnly") ? "{lang:commands.misc.help.yes}" : "{lang:commands.misc.help.no}"}**`,
					"",
					`**{lang:commands.misc.help.permissions}**:`,
					`\u25FD {lang:commands.misc.help.bot}: **${cmd.botPermissions.length === 0 ? "{lang:commands.misc.help.none}" : cmd.botPermissions.join("**, **")}**`,
					`\u25FD {lang:commands.misc.help.}user: **${cmd.userPermissions.length === 0 ? "{lang:commands.misc.help.none}" : cmd.userPermissions.join("**, **")}**`,
					"",
					"**Extra**:",
					`\u25FD {lang:commands.misc.help.usage}: \`${gConfig.settings.prefix}${cmd.triggers[0]} ${cmd.usage}\``,
					`\u25FD {lang:commands.misc.help.aliases}: ${cmd.triggers.join(", ")}`,
					`\u25FD {lang:commands.misc.help.normalCooldown}: ${Time.ms(cmd.cooldown, true)}`,
					`\u25FD {lang:commands.misc.help.donatorCooldown}: ${Time.ms(cmd.donatorCooldown, true)}`,
					`\u25FD {lang:commands.misc.help.category}: ${cat.displayName}`
				].join("\n"))
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
		});
	}

	if (this.cmd.categories.map(c => c.name.toLowerCase()).includes(msg.args[0].toLowerCase())) {
		const cat = this.cmd.getCategory(msg.args[0]);

		if (!cat) return msg.reply("{lang:commands.misc.help.catNotFound}");

		if (cat.devOnly && !config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.misc.help.devOnlyCat}");

		const embed = new EmbedBuilder(gConfig.settings.lang)
			.setTitle(cat.displayName)
			.setDescription(cat.description)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF));

		const fields: {
			name: string;
			value: string;
			inline: boolean;
		}[] = [];

		let i = 0;
		cat.commands.forEach((c) => {
			if (!(c.features.includes("devOnly") && !config.developers.includes(msg.author.id))) {
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

		fields.map(f => embed.addField(f.name, f.value, f.inline));
		return msg.channel.createMessage({ embed });
	}

	return msg.reply("{lang:commands.misc.help.neitherFound}");
}));
