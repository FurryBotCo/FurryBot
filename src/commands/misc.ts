import FurryBot from "../main";
import { ExtendedMessage } from "bot-stuff";
import config from "../config";
import phin from "phin";
import * as Eris from "eris";
import truncate from "truncate";
import CmdHandler from "../util/cmd";
import { Logger } from "clustersv2";
import { CommandError } from "command-handler";
import UserConfig from "../modules/config/UserConfig";
import GuildConfig from "../modules/config/GuildConfig";

CmdHandler
	.addCategory({
		name: "misc",
		displayName: ":thumbsup: Miscellaneous",
		devOnly: false,
		description: "Miscellaneous stuff."
	})
	.addCommand({
		triggers: [
			"content"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 2e3,
		description: "Get the content types for our image types",
		usage: "",
		features: [],
		category: "misc",
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			const req = await phin({
				method: "GET",
				url: "https://api.furry.bot/counts",
				parse: "json"
			});
			let txt = "";
			const recurse = (obj, i, r) => new Promise(async (a, b) => Promise.all(Object.keys(obj).map(async (o) => typeof obj[o] !== "object" ? txt += `${r.repeat(i)}${o}: ${obj[o]}\n` : (txt += `${r.repeat(i)}${o}:\n`, recurse(obj[o] as {}, i + 1, r)))).then(a));
			await recurse(req.body, 0, "\t");
			return msg.channel.createMessage(txt);
		})
	})
	.addCommand({
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
		category: "misc",
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			let embed: Eris.EmbedOptions;

			if (msg.args.length === 0) {
				const categories = [...CmdHandler.categories];

				categories.forEach((c) => {
					if ((c.devOnly && !config.developers.includes(msg.author.id))) categories.splice(categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()), categories.map(cat => cat.name.toLowerCase()).indexOf(c.name.toLowerCase()));
				});

				embed = {
					title: "Command Help",
					fields: categories.map(c => ({ name: `${c.displayName}`, value: `\`${msg.gConfig.settings.prefix}help ${c.name}\`\n[Hover for more info](https://furry.bot '${c.description}\n${CmdHandler.commands.filter(cmd => cmd.category.name === c.name).length} Commands Total')`, inline: true })),
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					},
					timestamp: new Date().toISOString(),
					color: this.f.randomColor()
				};

				return msg.channel.createMessage({ embed });
			}

			if (CmdHandler.commandTriggers.includes(msg.args[0].toLowerCase())) {
				const cmd = CmdHandler.getCommand(msg.args[0].toLowerCase());

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
							value: cmd.category.displayName,
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

			if (CmdHandler.categories.map(c => c.name.toLowerCase()).includes(msg.args[0].toLowerCase())) {
				const cat = CmdHandler.getCategory(msg.args[0]);

				if (!cat) return msg.reply("Category not found.");

				const fields: {
					name: string;
					value: string;
					inline: boolean;
				}[] = [];

				let i = 0;
				CmdHandler.commands.filter(cmd => cmd.category.name === cat.name).forEach((c) => {
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
		})
	})
	.addCommand({
		triggers: [
			"suggest"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 18e5,
		donatorCooldown: 18e5,
		description: "Suggest something for me!",
		usage: "<suggestion>",
		features: [],
		category: "misc",
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			// return msg.reply("We are not accepting suggestions at this time.");

			let card, embed: Eris.EmbedOptions;

			if (msg.unparsedArgs.length < 1 || !msg.unparsedArgs[0]) throw new CommandError(null, "ERR_INVALID_USAGE");
			try {
				card = await this.tclient.addCard(msg.unparsedArgs.join(" "), `Suggestion by ${msg.author.tag} (${msg.author.id}) from guild ${msg.guild.name} (${msg.guild.id})`, config.apis.trello.list);
			} catch (e) {
				return msg.reply(`Failed to create suggestion, **${e.message}**`);
			}

			await this.tclient.addLabelToCard(card.id, config.apis.trello.labels.unapproved).catch(err => null);
			await msg.reply(`Suggestion posted!\nView it here: ${card.shortUrl}`);

			embed = {
				title: `Suggestion by ${msg.author.tag} (${msg.author.id}) from guild ${msg.guild.name} (${msg.guild.id})`,
				description: truncate(msg.unparsedArgs.join(" "), 950),
				thumbnail: {
					url: msg.author.avatarURL
				},
				fields: [
					{
						name: "Trello Card",
						value: card.shortUrl,
						inline: false
					}
				],
				timestamp: new Date().toISOString(),
				color: this.f.randomColor()
			};

			return this.bot.executeWebhook(config.webhooks.suggestion.id, config.webhooks.suggestion.token, {
				embeds: [
					embed
				],
				username: `Bot Suggestion${config.beta ? " - Beta" : ""}`,
				avatarURL: "https://i.furry.bot/furry.png"
			});
		})
	})
	.addCommand({
		triggers: [
			"toggletips"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Toggle getting random tips.",
		usage: "",
		features: [],
		category: "misc",
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			if (msg.uConfig.tips) return msg.uConfig.edit({ tips: false }).then(d => d.reload()).then(() => msg.reply("Disabled tips."));
			else return msg.uConfig.edit({ tips: true }).then(d => d.reload()).then(() => msg.reply("Enabled tips."));
		})
	});

export default null;
