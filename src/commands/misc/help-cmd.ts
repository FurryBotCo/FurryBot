import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import * as Eris from "eris";
import { Time } from "../../util/Functions";

export default new Command({
	triggers: [
		"help",
		"h",
		"?"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 1e3,
	donatorCooldown: .5e3,
	description: "Get some help with the bot.",
	usage: "[command/category]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// await msg.channel.startTyping();
	// \u25FD
	let embed: Eris.EmbedOptions;

	if (msg.args.length === 0) {
		const categories = [...this.cmd.categories];

		categories.forEach((c) => {
			if ((c.devOnly && !config.developers.includes(msg.author.id))) categories.splice(categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()), categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()));
		});

		embed = {
			title: "Command Help",
			fields: categories.map(c => ({ name: `${c.displayName}`, value: `\`${msg.gConfig.settings.prefix}help ${c.name}\`\n[Hover for more info](https://furry.bot '${c.description}\n${c.commands.length} Commands Total')`, inline: true })),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			timestamp: new Date().toISOString(),
			color: Math.floor(Math.random() * 0xFFFFFF)
		};

		return msg.channel.createMessage({ embed });
	}

	if (this.cmd.commandTriggers.includes(msg.args[0].toLowerCase())) {
		const { cmd, cat } = this.cmd.getCommand(msg.args[0].toLowerCase());

		if (!cmd) return msg.reply("Command not found.");

		embed = {
			title: cmd.triggers[0],
			description: [
				cmd.description,
				"",
				`**Restrictions**:`,
				`\u25FD NSFW: **${cmd.features.includes("nsfw") ? "Yes" : "No"}**`,
				`\u25FD Developer Only: **${cmd.features.includes("devOnly") ? "Yes" : "No"}**`,
				`\u25FD Beta Only: **${cmd.features.includes("betaOnly") ? "Yes" : "No"}**`,
				`\u25FD Guild Owner Only: **${cmd.features.includes("guildOwnerOnly") ? "Yes" : "No"}**`,
				`\u25FD Support Server Only: **${cmd.features.includes("supportOnly") ? "Yes" : "No"}**`,
				`\u25FD Donator Only: **${cmd.features.includes("donatorOnly") ? "Yes" : "No"}**`,
				`\u25FD Premium Guild Only: **${cmd.features.includes("premiumGuildOnly") ? "Yes" : "No"}**`,
				"",
				`**Permissions**:`,
				`\u25FD Bot: **${cmd.botPermissions.length === 0 ? "NONE" : cmd.botPermissions.join("**, **")}**`,
				`\u25FD User: **${cmd.userPermissions.length === 0 ? "NONE" : cmd.userPermissions.join("**, **")}**`,
				"",
				"**Extra**:",
				`\u25FD Usage: \`${msg.gConfig.settings.prefix}${cmd.triggers[0]} ${cmd.usage}\``,
				`\u25FD Aliases: ${cmd.triggers.join(", ")}`,
				`\u25FD Normal Cooldown: ${Time.ms(cmd.cooldown, true)}`,
				`\u25FD Donator Cooldown: ${Time.ms(cmd.donatorCooldown, true)}`,
				`\u25FD Category: ${cat.displayName}`
			].join("\n"),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			timestamp: new Date().toISOString(),
			color: Math.floor(Math.random() * 0xFFFFFF)
		};


		return msg.channel.createMessage({ embed });
	}

	if (this.cmd.categories.map(c => c.name.toLowerCase()).includes(msg.args[0].toLowerCase())) {
		const cat = this.cmd.getCategory(msg.args[0]);

		if (!cat) return msg.reply("Category not found.");

		const fields: {
			name: string;
			value: string;
			inline: boolean;
		}[] = [];

		let i = 0;
		cat.commands.forEach((c) => {
			if (!fields[i]) fields[i] = {
				name: `Command List #${i + 1}`,
				value: "",
				inline: false
			};

			const txt = `\`${c.triggers[0]}\` - ${c.description}`;

			if (fields[i].value.length > 1000 || fields[i].value.length + txt.length > 1000) {
				i++;
				return fields[i] = {
					name: `Command List #${i + 1}`,
					value: txt,
					inline: false
				};
			} else {
				return fields[i].value = `${fields[i].value}\n${txt}`;
			}
		});

		embed = {
			title: cat.displayName,
			description: cat.description,
			fields,
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			timestamp: new Date().toISOString(),
			color: Math.floor(Math.random() * 0xFFFFFF)
		};

		return msg.channel.createMessage({ embed });
	}

	return msg.reply("Command or category not found.");
}));
