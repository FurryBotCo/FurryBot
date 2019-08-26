import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";

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
	cooldown: .5e3,
	description: "Get some help with the bot",
	usage: "[command or category]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let embed: Eris.EmbedOptions;

	if (msg.args.length === 0) {

		const categories = this.categories.map(c => {
			const j: any = { ...{}, ...c };
			j.commands = c.commands.map(cmd => cmd.triggers[0]);
			return j;
		});
		categories.forEach((c) => {
			if ((c.name.toLowerCase() === "developer" && !config.developers.includes(msg.author.id))) categories.splice(categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()), categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()));
		});

		embed = {
			title: "Command Help",
			fields: categories.map(c => ({ name: `${c.displayName}`, value: `\`${msg.gConfig.prefix}help ${c.name}\`\n[Hover for more info](https://reddit.furry.host '${c.description}\n${c.commands.length} Commands Total')`, inline: true })),
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			timestamp: new Date().toISOString(),
			color: functions.randomColor()
		};
		return msg.channel.createMessage({ embed });
	}

	if (this.commandTriggers.includes(msg.args[0].toLowerCase())) {
		const { command: [cmd], category: cat } = await this.getCommand(msg.args[0].toLowerCase());

		if (!cmd) return msg.reply("Command not found.");
		embed = {
			title: cmd.triggers[0],
			description: cmd.description,
			fields: [
				{
					name: "Usage",
					value: `\`${msg.gConfig.prefix}${cmd.triggers[0]} ${cmd.usage}\``,
					inline: false
				},
				{
					name: "Restrictions",
					value: `NSFW: **${cmd.nsfw ? "Yes" : "No"}**\nDeveloper Only: **${cmd.devOnly ? "Yes" : "No"}**\nGuild Owner Only: **${cmd.guildOwnerOnly ? "Yes" : "No"}**`,
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
					value: functions.ms(cmd.cooldown),
					inline: false
				}
			],
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			timestamp: new Date().toISOString(),
			color: functions.randomColor()
		};

		if (config.developers.includes(msg.author.id)) embed.fields.push({
			name: "Path (dev)",
			value: cmd.path,
			inline: false
		});

		return msg.channel.createMessage({ embed });
	}

	if (this.categories.map(c => c.name.toLowerCase()).includes(msg.args[0].toLowerCase())) {
		const cat = await this.getCategory(msg.args[0]);

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
			color: functions.randomColor()
		};

		if (config.developers.includes(msg.author.id)) embed.fields.push({
			name: "Path (dev)",
			value: cat.path,
			inline: false
		});

		return msg.channel.createMessage({ embed });
	}

	return msg.reply("Command or category not found.");
}));