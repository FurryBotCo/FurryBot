import client from "../../index";
import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import functions from "../util/functions";
import config from "../config";
import { Command, CommandError } from "../util/CommandHandler";
import { mdb } from "../modules/Database";
import * as Eris from "eris";
import chunk from "chunk";

type CommandContext = FurryBot & { _cmd: Command };

client.cmdHandler
	.addCategory({
		name: "utility",
		displayName: ":tools: Utility",
		devOnly: false,
		description: "Helpful things for the bot, and your server."
	})
	.addCommand({
		triggers: [
			"asar",
			"addselfassignablerole"
		],
		userPermissions: [
			"manageRoles"
		],
		botPermissions: [
			"manageRoles"
		],
		cooldown: 3e3,
		donatorCooldown: 2e3,
		description: "Add a self assignable role.",
		usage: "<@role/id/name>",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let role, roles, a, b;
			role = await msg.getRoleFromArgs(0, true, true);
			if (!role) return msg.errorEmbed("INVALID_ROLE");
			a = functions.compareMemberWithRole(msg.member, role);
			b = functions.compareMemberWithRole(msg.guild.members.get(this.user.id), role);
			if ((a.higher || a.same) && msg.channel.guild.ownerID !== msg.member.id) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot add roles as high as, or higher than you.`);
			if (b.higher || b.same) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
			if (role.managed) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
			roles = msg.gConfig.selfAssignableRoles;
			if (roles.includes(role.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is already listed as a self assignable role.`);
			await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $push: { selfAssignableRoles: role.id } });
			return msg.channel.createMessage(`<@!${msg.author.id}>, Added **${role.name}** to the list of self assignable roles.`);
		})
	})
	/*.addCommand({
		triggers: [
			"disable"
		],
		userPermissions: [
			"manageGuild"
		],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 5e3,
		description: "Disable commands or categories in your server. If no second argument is provided, this will be applied server-wide.",
		usage: "<command/category< [@role/@member/#channel/id]",
		features: ["betaOnly", "devOnly"],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (typeof msg.gConfig.commandConfig.disabled === "undefined") await msg.gConfig.edit({ commandConfig: { disabled: [] } }).then(d => d.reload());

			let type;

			const bl = [
				"disable",
				"enable",
				"help",
				"toggletips",
				"delcmds"
			];

			if (bl.includes(msg.args[0].toLowerCase())) return msg.reply(`**${msg.args[0].toLowerCase()}** is a blacklisted category/command, and cannot be disabled, or enabled.`);

			if (msg.args.length === 1) {
				type = "server";

				let c;
				c = this.cmdHandler.getCommand(msg.args[0].toLowerCase());
				if (!c) c = this.cmdHandler.getCategory(msg.args[0].toLowerCase());

				if (!c) return msg.reply("that was not a valid command, or category");

				if (msg.gConfig.commandConfig.disabled.filter((c) => c.selectionType === type).map(c => c.selection.toLowerCase().includes(msg.args[0].toLowerCase()))) return msg.reply("that selection is already disabled.");
			} else {

			}
		})
	})*/
	.addCommand({
		triggers: [
			"iam",
			"roleme"
		],
		userPermissions: [],
		botPermissions: [
			"manageRoles"
		],
		cooldown: 5e3,
		donatorCooldown: 5e3,
		description: "Get a self assignable role.",
		usage: "<role>",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let roles, b, a, role;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			roles = msg.gConfig.selfAssignableRoles.map(a => {
				b = msg.channel.guild.roles.get(a);
				if (!b) return { id: null, name: null };
				return { name: b.name.toLowerCase(), id: a };
			});
			if (!roles.map(r => r.name).includes(msg.args.join(" ").toLowerCase())) {
				if (msg.channel.guild.roles.find(r => r.name.toLowerCase() === msg.args.join(" ").toLowerCase())) return msg.channel.createMessage(`<@!${msg.author.id}>,That role is not self assignable.`);
				return msg.channel.createMessage(`<@!${msg.author.id}>, Role not found.`);
			}
			role = roles.filter(r => r.name === msg.args.join(" ").toLowerCase());
			if (!role || role.length === 0) return msg.channel.createMessage(`<@!${msg.author.id}>, Role not found.`);
			role = role[0];
			if (msg.member.roles.includes(role.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, You already have this role.`);
			a = functions.compareMemberWithRole(msg.guild.members.get(this.user.id), role);
			if (a.higher || a.same) return msg.channel.createMessage(`<@!${msg.author.id}>, That role is higher than, or as high as my highest role.`);
			await msg.member.addRole(role.id, "iam command");
			return msg.channel.createMessage(`<@!${msg.author.id}>, You now have the **${role.name}** role.`);
		})
	})
	.addCommand({
		triggers: [
			"iamn",
			"iamnot",
			"rolemenot"
		],
		userPermissions: [],
		botPermissions: [
			"manageRoles"
		],
		cooldown: 5e3,
		donatorCooldown: 5e3,
		description: "Remove a self assignable role from yourself.",
		usage: "<role>",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let roles, b, a, role;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			roles = msg.gConfig.selfAssignableRoles.map(a => {
				b = msg.channel.guild.roles.get(a);
				if (!b) return { id: null, name: null };
				return { name: b.name.toLowerCase(), id: a };
			});
			if (!roles.map(r => r.name).includes(msg.args.join(" ").toLowerCase())) {
				if (msg.channel.guild.roles.find(r => r.name.toLowerCase() === msg.args.join(" ").toLowerCase())) return msg.channel.createMessage(`<@!${msg.author.id}>, That role is not self assignable.`);
				return msg.channel.createMessage(`<@!${msg.author.id}>, Role not found.`);
			}
			role = roles.filter(r => r.name === msg.args.join(" ").toLowerCase());
			if (!role || role.length === 0) return msg.channel.createMessage("Role not found.");
			role = role[0];
			if (!msg.member.roles.includes(role.id)) return msg.channel.createMessage("You don't have this role.");
			a = functions.compareMemberWithRole(msg.guild.members.get(this.user.id), role);
			if (a.higher || a.same) return msg.channel.createMessage(`<@!${msg.author.id}>, That role is higher than, or as high as my highest role.`);
			await msg.member.removeRole(role.id, "iamnot command");
			return msg.channel.createMessage(`<@!${msg.author.id}>, You no longer have the **${role.name}** role.`);
		})
	})
	.addCommand({
		triggers: [
			"link"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 15e3,
		donatorCooldown: 15e3,
		description: "Look for your Patreon subscription.",
		usage: "",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.uConfig.patreon.donator) return msg.reply("you are already marked as a donator.");

			const p = await functions.loopPatrons();

			for (const patron of p) {
				const discord = patron.attributes.social_connections.discord;
				if (discord && patron.payment_data && (discord.user_id === msg.author.id)) {
					await msg.uConfig.edit({
						patreon: {
							amount: patron.payment_data.amount_cents / 100,
							createdAt: new Date(patron.payment_data.created_at).getTime(),
							declinedAt: new Date(patron.payment_data.declined_id).getTime(),
							donator: true,
							patronId: patron.id
						}
					}).then(d => d.reload());

					const dm = await msg.author.getDMChannel();

					const embed: Eris.EmbedOptions = {
						title: "Successfully Linked!",
						description: `Thanks for donating! Donator perks are still in beta, so they may be a bit buggy on being enabled. You can gain some extra ${config.eco.emoji} by using \`${msg.gConfig.prefix}redeem\`.`,
						color: functions.randomColor(),
						timestamp: new Date().toISOString()
					};

					if (!dm) await msg.channel.createMessage({ embed });
					try {
						await dm.createMessage({ embed });
					} catch (e) {
						await msg.channel.createMessage({ embed });
					}

					await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
						embeds: [
							{
								author: {
									name: msg.author.tag,
									icon_url: msg.author.avatarURL
								},
								description: `User ${msg.author.tag} (${msg.author.id}) linked their patreon account **${patron.attributes.full_name}** with the donation amount $${patron.payment_data.amount_cents / 100}, and has recieved donator perks.`
							}
						],
						username: `Furry Bot Donation Logs${config.beta ? " - Beta" : ""}`,
						avatarURL: "https://i.furry.bot/furry.png"
					});

					return msg.reply(`Successfully linked your Discord account to Patreon, if you need any help, you can visit our support server here: ${config.bot.supportInvite}`);
				}

				return msg.reply(`We were unable to link your Discord account with your Patreon account, make sure you have donated, and that the payment was successful. If you need more help, you can visit us here: ${config.bot.supportInvite}`);
			}
		})
	})
	.addCommand({
		triggers: [
			"lsar",
			"listselfassignableroles"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 5e3,
		donatorCooldown: 5e3,
		description: "List this servers self assignable roles.",
		usage: "[page]",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let roles, page, c, remove, rl, b, embed;
			roles = msg.gConfig.selfAssignableRoles;
			page = msg.args.length > 0 ? parseInt(msg.args[0], 10) : 1;
			if (roles.length === 0) return msg.reply("There are no roles set as self assignable.");
			c = chunk(roles, 10);
			if (c.length === 0) return msg.reply("There are no roles set as self assignable.");
			if (!page || page > c.length) return msg.reply("Invalid page.");
			remove = [];
			rl = roles.map(a => {
				b = msg.channel.guild.roles.get(a);
				if (!b) {
					remove.push(a);
					return `Role Not Found - \`${a}\``;
				}
				return b.name;
			}).join("\n");
			if (remove.length > 0) await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $pull: { selfAssignableRoles: { $each: remove } } });
			embed = {
				title: "Self Assignable Roles",
				description: `To gain a role, use the command \`${msg.gConfig.prefix}iam <role name>\`\nTo go to the next page, use \`${msg.gConfig.prefix}lsar [page]\`.\nPage ${page}/${c.length}`,
				fields: [
					{
						name: "Roles",
						value: rl,
						inline: false
					}
				]
			};
			Object.assign(embed, msg.embed_defaults());
			return msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"modules"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 1e3,
		donatorCooldown: 1e3,
		description: "List the current statuses of my modules in this server.",
		usage: "",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const embed: Eris.EmbedOptions = {
				title: "Module Status",
				description: "The status of some modules on this server.",
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				fields: [
					{
						name: "NSFW",
						value: msg.gConfig.nsfwEnabled ? "Enabled" : "Disabled",
						inline: false
					},
					{
						name: "Delete Command Invocations",
						value: msg.gConfig.deleteCommands ? "Enabled" : "Disabled",
						inline: false
					},
					{
						name: "F Response",
						value: msg.gConfig.fResponseEnabled ? "Enabled" : "Disabled",
						inline: false
					}
				],
				color: functions.randomColor(),
				timestamp: new Date().toISOString()
			};

			return msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"prefix"
		],
		userPermissions: [
			"manageGuild"
		],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "List this servers prefix, or change my prefix for this server.",
		usage: "[new prefix]",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length === 0) return msg.channel.createMessage(`This servers prefix is "${msg.gConfig.prefix}", if you want to change this, run this again with the new prefix!`);

			if (msg.args.join("").toLowerCase() === msg.gConfig.prefix.toLowerCase()) return msg.reply("that is already this servers prefix.");

			if ([`<@!${this.user.id}>`, `<@${this.user.id}>`].some(t => msg.args.join("").toLowerCase() === t.toLowerCase())) return msg.reply(`you cannot use ${msg.args.join("").toLowerCase()} as my prefix.`);

			if (msg.args.join("").length > 15) return msg.reply("the maximum length for my prefix is 15 characters (not counting spaces).");

			await msg.gConfig.edit({ prefix: msg.args.join("").toLowerCase() }).then(d => d.reload());

			return msg.reply(`set this servers prefix to ${msg.args.join("").toLowerCase()}`);
			// return msg.channel.createMessage(`This servers prefix is "${msg.gConfig.prefix}", if you want to change this, please use \`${msg.gConfig.prefix}settings prefix <new prefix>\` to change this servers prefix!`);
		})
	})
	.addCommand({
		triggers: [
			"prune",
			"purge",
			"clear"
		],
		userPermissions: [
			"manageMessages"
		],
		botPermissions: [
			"manageMessages"
		],
		cooldown: 1.5e3,
		donatorCooldown: 1.5e3,
		description: "Clear messages in a channel.",
		usage: "<2-100>",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let count = parseInt(msg.args[0], 10);
			if (msg.args.length === 0 || isNaN(count)) throw new CommandError(null, "ERR_INVALID_USAGE");
			if (count < 2 || count > 100) return msg.reply("Please provide a valid number between two (2) and 100.");
			if (count < 100) count++;

			const m = await msg.channel.getMessages(count);
			const f = m.filter(d => !(d.timestamp + 12096e5 < Date.now()));
			await msg.channel.deleteMessages(f.map(j => j.id));
			if (m.length !== f.length) await msg.channel.createMessage(`Skipped ${m.length - f.length} message(s), reason: over 2 weeks old.`);
		})
	})
	/*.addCommand({
		triggers: [
			"regsetup"
		],
		userPermissions: [
			"manageGuild"
		],
		botPermissions: [
			"manageRoles",
			"manageWebhooks"
		],
		cooldown: 36e5,
		donatorCooldown: 36e5,
		description: "Setup the registration command in this server.",
		usage: "",
		features: ["betaOnly", "devOnly"],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			await msg.reply("registration is currently not setup here, would you like to set it up? You can reply with **yes** or **no**.");

			const d = await this.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4, (m: Eris.Message) => ["no", "yes"].includes(m.content.toLowerCase()));
			if (!d) return msg.reply("command timed out, try to be a little quicker..");
			if (d.content.toLowerCase() === "no") return msg.reply("you canceled.");

			const ask = (async (q, f = (m: Eris.Message) => m) => {
				await msg.reply(q);
				const c = await this.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4, f);
				if (!c) return "TIMEOUT";
				else return c.content;
			});
			await msg.reply("to setup registration, I need to know a few things about how you want it to work.");

			const logs = await ask("where would you like to send the registration logs? Like the responses, and a few other things. You can reply with either a channel, or **none** to skip.");

			if (logs === "TIMEOUT") return msg.reply("command timed out, try to be a little quicker..");
		})
	})*/
	.addCommand({
		triggers: [
			"reset",
			"resetguild",
			"resetguildsettings"
		],
		userPermissions: [
			"manageGuild"
		],
		botPermissions: [],
		cooldown: 36e5,
		donatorCooldown: 36e5,
		description: "Reset the current servers settings.",
		usage: "",
		features: ["guildOwnerOnly"],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let choice;
			msg.channel.createMessage("this will erase ALL guild (server) settings, are you sure you want to do this?\nType **yes** or **no**.");
			const d = await this.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
			if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply("that wasn't a valid option..");
			choice = d.content.toLowerCase() === "yes";

			if (!choice) {
				return msg.channel.createMessage("Canceled reset.");
			} else {
				await msg.channel.createMessage(`All guild settings will be reset shortly.\n(note: prefix will be **${config.defaultPrefix}**)`);
				try {
					await msg.gConfig.reset().then(d => d.reload());
				} catch (e) {
					this.logger.error(e, msg.guild.shard.id);
					return msg.channel.createMessage("There was an internal error while doing this");
				}
			}

			return;
		})
	})
	.addCommand({
		triggers: [
			"rsar",
			"removeselfassignablerole"
		],
		userPermissions: [
			"manageRoles"
		],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 2e3,
		description: "Remove a self assignable role",
		usage: "<@role/id/name>",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let role, roles;
			role = await msg.getRoleFromArgs(0, true, true);
			if (!role) return msg.errorEmbed("INVALID_ROLE");
			roles = msg.gConfig.selfAssignableRoles;
			if (!roles.includes(role.id)) return msg.channel.createMessage("this role is not listed as a self assignable role.");
			await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $pull: { selfAssignableRoles: role.id } });
			return msg.channel.createMessage(`Removed **${role.name}** from the list of self assignable roles.`);
		})
	})
	.addCommand({
		triggers: [
			"settings"
		],
		userPermissions: [
			"manageGuild"
		],
		botPermissions: [],
		cooldown: 1e3,
		donatorCooldown: 1e3,
		description: "Edit this servers settings.",
		usage: "",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {

			const settings = ["fResponse", "nsfw", "delCmds", "commandImages"/*, "prefix"*/];
			const choices = ["enabled", "enable", "e", "true", "disabled", "disable", "d", "false"];

			if (msg.args.length === 0 || ["list", "ls"].some(s => msg.args[0].toLowerCase().indexOf(s) !== -1)) return msg.reply(`valid settings: **${settings.join("**, **")}**`);

			if (!settings.map(s => s.toLowerCase()).includes(msg.args[0].toLowerCase())) return msg.reply(`Invalid setting, valid settings: **${settings.join("**, **")}**`);

			let type;

			switch (msg.args[0].toLowerCase()) {
				case "fresponse":
					type = "fResponseEnabled";
					break;

				case "nsfw":
					type = "nsfwEnabled";
					break;

				case "delcmds":
					type = "deleteCommands";
					break;

				case "commandimages":
					type = "commandImages";
					break;

				/*case "prefix":
					type = "prefix";
					break;*/
			}

			if (msg.args.length === 1) return msg.reply(`This setting **${type}** is currently set to ${msg.gConfig[type] ? "Enabled" : "Disabled"}, use \`${msg.gConfig.prefix}settings ${msg.args[0]} <enabled/disabled>\` to toggle it.`);

			/*if (type === "prefix") {
				const a = [...msg.args].slice(1, msg.args.length).join("");
				if (a.toLowerCase() === msg.gConfig.prefix.toLowerCase()) return msg.reply("that is already this servers prefix.");

				if ([`<@!${this.user.id}>`, `<@${this.user.id}>`].some(t => a.toLowerCase() === t.toLowerCase())) return msg.reply(`you cannot use ${a.toLowerCase()} as my prefix.`);

				if (a.length > 15) return msg.reply("the maximum length for my prefix is 15 characters (not counting spaces).");

				await msg.gConfig.edit({ prefix: a.toLowerCase() }).then(d => d.reload());

				return msg.reply(`set this servers prefix to ${a.toLowerCase()}`);
			}*/

			if (!choices.includes(msg.args[1].toLowerCase())) msg.reply("Invalid choice, try **enabled** or **disabled**.");

			if (msg.args.length < 2) throw new CommandError(null, "ERR_INVALID_USAGE");


			switch (msg.args[1].toLowerCase()) {
				case "enabled":
				case "enable":
				case "e":
				case "true":
					await msg.gConfig.edit({ [type]: true }).then(d => d.reload());
					return msg.reply(`Enabled ${msg.args[0]}, use \`${msg.gConfig.prefix}settings ${msg.args[0]} disabled\` to disable.`);
					break;

				case "disabled":
				case "disable":
				case "d":
				case "false":
					await msg.gConfig.edit({ [type]: false }).then(d => d.reload());
					return msg.reply(`Disabled ${msg.args[0]}, use \`${msg.gConfig.prefix}settings ${msg.args[0]} enabled\` to enable.`);
					break;
			}
		})
	})
	.addCommand({
		triggers: [
			"settopic",
			"st"
		],
		userPermissions: [
			"manageChannels"
		],
		botPermissions: [
			"manageChannels"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Set a text channel's topic",
		usage: "<topic>",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			return msg.channel.edit({ topic: msg.unparsedArgs.join(" ") }, `Command: ${msg.author.username}#${msg.author.discriminator}`).then((c: Eris.TextChannel) =>
				msg.channel.createMessage(`Set the topic of <#${c.id}> to **${!c.topic ? "NONE" : c.topic}**`)
			);
		})
	})
	.addCommand({
		triggers: [
			"spacify"
		],
		userPermissions: [
			"manageChannels"
		],
		botPermissions: [
			"manageChannels"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Replaces dashes with 'spaces' in channel names.",
		usage: "<channel>",
		features: [],
		category: "utility",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			const ch = await msg.getChannelFromArgs();
			if (!ch) return msg.errorEmbed("INVALID_CHANNEL");
			if (ch.name.indexOf("-") === -1) return msg.channel.createMessage("Channel name contains no dashes (-) to replace.");
			await ch.edit({
				name: ch.name.replace(/-/g, "\u2009\u2009")
			}, `${msg.author.username}#${msg.author.discriminator}: Spacify ${ch.name}`);
			return msg.channel.createMessage(`Spacified <#${ch.id}>!`);
		})
	});

export default null;