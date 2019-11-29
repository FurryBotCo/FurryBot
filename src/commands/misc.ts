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
			const m = await this.bot.executeWebhook(config.webhooks.suggestion.id, config.webhooks.suggestion.token, {
				embeds: [
					{
						title: `Suggestion by ${msg.author.tag} from guild ${msg.guild.name}`,
						description: `${truncate(msg.unparsedArgs.join(" "), 950)}`,
						thumbnail: {
							url: msg.author.avatarURL
						},
						timestamp: new Date().toISOString(),
						color: this.f.randomColor(),
						footer: {
							text: `User ID: ${msg.author.id} | Guild ID: ${msg.channel.guild.id}`
						}
					}
				],
				username: `Bot Suggestion${config.beta ? " - Beta" : ""}`,
				avatarURL: "https://i.furry.bot/furry.png",
				wait: true
			});
			try {
				await m.addReaction(config.emojis.upvote);
				await m.addReaction(config.emojis.downvote);
			} catch (e) { }
			return msg.channel.createMessage({
				embed: {
					title: "Suggestion Posted!",
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					},
					description: `Your suggestion was posted! You can view it [here](https://discord.gg/CQMx76B).`,
					timestamp: new Date().toISOString(),
					color: this.f.randomColor()
				}
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
	})
	.addCommand({
		triggers: [
			"preferences"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 1e3,
		donatorCooldown: 1e3,
		description: "Manage your personal preferences.",
		usage: "",
		features: [],
		category: "misc",
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			const settings = {
				mention: "boolean"
			};

			const booleanChoices = {
				enabled: true,
				enable: true,
				e: true,
				true: true,
				disabled: false,
				disable: false,
				d: false,
				false: false
			};

			if (msg.args.length === 0 || ["list", "ls"].some(s => msg.args[0].toLowerCase().indexOf(s) !== -1)) return msg.reply(`valid preferences: **${Object.keys(settings).join("**, **")}**`);
			const c = msg.args[0].toLowerCase();
			const s = Object.values(settings)[Object.keys(settings).map(s => s.toLowerCase()).indexOf(c.toLowerCase())];
			const set = Object.keys(settings)[Object.keys(settings).map(s => s.toLowerCase()).indexOf(c.toLowerCase())];
			if (!Object.keys(settings).map(s => s.toLowerCase()).includes(c)) return msg.reply(`Invalid setting. You can use \`${msg.gConfig.settings.prefix}preferences list\` to list preferences.`);
			if (msg.args.length === 1) return msg.reply(`The preference ${set} is currently set to ${msg.uConfig.preferences[set]}.`);
			else {
				let o;
				switch (s) {
					case "boolean":
						if (!Object.keys(booleanChoices).includes(msg.args[1].toLowerCase())) return msg.reply(`Invalid choice, must be one of "enabled", "disabled".`);
						o = msg.uConfig.preferences[set];
						await msg.uConfig.edit({ preferences: { [set]: booleanChoices[msg.args[1].toLowerCase()] } });
						return msg.reply(`Changed the preference **${set}** from "${o ? "enabled" : "disabled"}" to "${booleanChoices[msg.args[1].toLowerCase()] ? "enabled" : "disabled"}".`);
						break;

					case "string":
						o = msg.uConfig.preferences[set];
						await msg.uConfig.edit({ preferences: { [set]: msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" ") } });
						return msg.reply(`Changed the preference **${set}** from "${o}" to "${msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" ")}"`);
						break;

				}
			}
		})
	});

export default null;
