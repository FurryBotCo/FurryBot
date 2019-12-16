import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

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
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
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
			color: this.f.randomColor()
		};

		return msg.channel.createMessage({ embed });
	}

	if (this.cmd.commandTriggers.includes(msg.args[0].toLowerCase())) {
		const { cmd, cat } = this.cmd.getCommand(msg.args[0].toLowerCase());

		if (!cmd) return msg.reply("Command not found.");

		embed = {
			title: cmd.triggers[0],
			description: cmd.description,
			fields: [
				{
					name: "Usage",
					value: `\`${msg.gConfig.settings.prefix}${cmd.triggers[0]} ${cmd.usage}\``,
					inline: false
				},
				{
					name: "Restrictions",
					value: `NSFW: **${cmd.features.includes("nsfw") ? "Yes" : "No"}**\nDeveloper Only: **${cmd.features.includes("devOnly") ? "Yes" : "No"}**\nBeta Only: **${cmd.features.includes("betaOnly") ? "Yes" : "No"}**\nGuild Owner Only: **${cmd.features.includes("guildOwnerOnly") ? "Yes" : "No"}**`,
					inline: false
				},
				{
					name: "Permissions",
					value: `Bot: **${cmd.botPermissions.length === 0 ? "NONE" : cmd.botPermissions.join("**, **")}**\nUser: **${cmd.userPermissions.length === 0 ? "NONE" : cmd.userPermissions.join("**, **")}**`,
					inline: false
				},
				{
					name: "Aliases",
					value: cmd.triggers.join(", "),
					inline: false
				},
				{
					name: "Cooldown",
					value: await this.f.ms(cmd.cooldown, true) as string,
					inline: false
				},
				{
					name: "Category",
					value: cat.displayName,
					inline: false
				}
			],
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			timestamp: new Date().toISOString(),
			color: this.f.randomColor()
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
			color: this.f.randomColor()
		};

		return msg.channel.createMessage({ embed });
	}

	return msg.reply("Command or category not found.");
}));
