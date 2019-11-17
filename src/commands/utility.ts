import FurryBot from "../main";
import { ExtendedMessage } from "bot-stuff";
import config from "../config";
import { mdb } from "../modules/Database";
import * as Eris from "eris";
import chunk from "chunk";
import CmdHandler from "../util/cmd";
import { Logger } from "clustersv2";
import { CommandError } from "command-handler";
import UserConfig from "../modules/config/UserConfig";
import GuildConfig from "../modules/config/GuildConfig";

CmdHandler
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			const role = await msg.getRoleFromArgs(0, true, true);
			if (!role) return msg.errorEmbed("INVALID_ROLE");
			const a = this.f.compareMemberWithRole(msg.member, role);
			const b = this.f.compareMemberWithRole(msg.guild.members.get(this.bot.user.id), role);
			if ((a.higher || a.same) && msg.channel.guild.ownerID !== msg.member.id) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot add roles as high as, or higher than you.`);
			if (b.higher || b.same) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is higher than, or as high as me, I cannot remove or assign it.`);
			if (role.managed) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is managed (likely permissions for a bot), these cannot be removed or assigned.`);
			const roles = msg.gConfig.selfAssignableRoles;
			if (roles.includes(role.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, this role is already listed as a self assignable role.`);
			await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $push: { selfAssignableRoles: role.id } });
			await msg.gConfig.modlog.add({ blame: msg.author.id, action: "addSelfAssignableRole", role: role.id, timestamp: Date.now() });
			return msg.channel.createMessage(`<@!${msg.author.id}>, Added **${role.name}** to the list of self assignable roles.`);
		})
	})

	.addCommand({
		triggers: [
			"seen",
			"seenon"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get the servers I share with a user.",
		usage: "<@member/id>",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			const user = msg.args.length === 0 || !msg.args ? msg.member : await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			const a = this.bot.guilds.filter(g => g.members.has(user.id)),
				b = a.map(g => `${g.name} (${g.id})`),
				guilds = [],
				fields = [];

			let i = 0;

			for (const key in b) {
				if (!guilds[i]) guilds[i] = "";
				if (guilds[i].length > 1000 || +guilds[i].length + b[key].length > 1000) {
					i++;
					guilds[i] = b[key];
				} else {
					guilds[i] += `\n${b[key]}`;
				}
			}

			guilds.forEach((g, c) => {
				fields.push({
					name: `Server List #${+c + 1}`,
					value: g,
					inline: false
				});
			});

			const embed = {
				title: `Seen On ${b.length} Servers - ${user.user.username}#${user.user.discriminator} (${user.id})`,
				description: `I see this user in ${b.length} other guilds.`,
				fields
			};

			msg.channel.createMessage({ embed });
		})
	})
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {

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
			a = this.f.compareMemberWithRole(msg.guild.members.get(this.bot.user.id), role);
			if (a.higher || a.same) return msg.channel.createMessage(`<@!${msg.author.id}>, That role is higher than, or as high as my highest role.`);
			await msg.member.removeRole(role.id, "iamnot command");

			await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "removeRole", role: role.id, reason: "iamnot command", userId: msg.author.id, timestamp: Date.now() });
			return msg.channel.createMessage(`<@!${msg.author.id}>, You no longer have the **${role.name}** role.`);
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
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
			a = this.f.compareMemberWithRole(msg.guild.members.get(this.bot.user.id), role);
			if (a.higher || a.same) return msg.channel.createMessage(`<@!${msg.author.id}>, That role is higher than, or as high as my highest role.`);
			await msg.member.removeRole(role.id, "iamnot command");

			await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "removeRole", role: role.id, reason: "iamnot command", userId: msg.author.id, timestamp: Date.now() });
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			if (msg.uConfig.patreon.donator) return msg.reply("you are already marked as a donator.");

			const p = await this.f.loopPatrons();

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
						description: `Thanks for donating! Donator perks are still in beta, so they may be a bit buggy on being enabled. You can gain some extra ${config.eco.emoji} by using \`${msg.gConfig.settings.prefix}redeem\`.`,
						color: this.f.randomColor(),
						timestamp: new Date().toISOString()
					};

					if (!dm) await msg.channel.createMessage({ embed });
					try {
						await dm.createMessage({ embed });
					} catch (e) {
						await msg.channel.createMessage({ embed });
					}

					await this.bot.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
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
				description: `To gain a role, use the command \`${msg.gConfig.settings.prefix}iam <role name>\`\nTo go to the next page, use \`${msg.gConfig.settings.prefix}lsar [page]\`.\nPage ${page}/${c.length}`,
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			if (msg.args.length === 0) return msg.channel.createMessage(`This servers prefix is "${msg.gConfig.settings.prefix}", if you want to change this, run this again with the new prefix!`);
			if (msg.args.join("").toLowerCase() === msg.gConfig.settings.prefix.toLowerCase()) return msg.reply("that is already this servers prefix.");
			if ([`<@!${this.bot.user.id}>`, `<@${this.bot.user.id}>`].some(t => msg.args.join("").toLowerCase() === t.toLowerCase())) return msg.reply(`you cannot use ${msg.args.join("").toLowerCase()} as my prefix.`);
			if (msg.args.join("").length > 15) return msg.reply("the maximum length for my prefix is 15 characters (not counting spaces).");
			const o = msg.gConfig.settings.prefix;
			await msg.gConfig.edit({ settings: { prefix: msg.args.join("").toLowerCase() } }).then(d => d.reload());
			await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: "prefix", oldValue: o, newValue: msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" "), timestamp: Date.now() });
			return msg.reply(`set this servers prefix to ${msg.args.join("").toLowerCase()}`);
			// return msg.channel.createMessage(`This servers prefix is "${msg.gConfig.settings.prefix}", if you want to change this, please use \`${msg.gConfig.settings.prefix}settings prefix <new prefix>\` to change this servers prefix!`);
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			let count = parseInt(msg.args[0], 10);
			if (msg.args.length === 0 || isNaN(count)) throw new CommandError(null, "ERR_INVALID_USAGE");
			if (count < 2 || count > 100) return msg.reply("Please provide a valid number between two (2) and 100.");
			if (count < 100) count++;

			const m = await msg.channel.getMessages(count);
			const f = m.filter(d => !(d.timestamp + 12096e5 < Date.now()));
			await msg.channel.deleteMessages(f.map(j => j.id));
			await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "purgeMessages", count, actual: f.length, timestamp: Date.now() });
			if (m.length !== f.length) await msg.channel.createMessage(`Skipped ${m.length - f.length} message(s), reason: over 2 weeks old.`);
		})
	})
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			let choice;
			msg.channel.createMessage("this will erase ALL guild (server) settings, are you sure you want to do this?\nType **yes** or **no**.");
			const d = await this.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
			if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply("that wasn't a valid option..");
			choice = d.content.toLowerCase() === "yes";

			if (!choice) {
				return msg.channel.createMessage("Canceled reset.");
			} else {

				await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "resetSettings", old: msg.gConfig, timestamp: Date.now() });
				await msg.channel.createMessage(`All guild settings will be reset shortly.\n(note: prefix will be **${config.defaultPrefix}**)`);
				try {
					await msg.gConfig.reset().then(d => d.reload());
				} catch (e) {
					Logger.error(e, msg.guild.shard.id);
					return msg.channel.createMessage("There was an internal error while doing this");
				}
			}
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			let role, roles;
			role = await msg.getRoleFromArgs(0, true, true);
			if (!role) return msg.errorEmbed("INVALID_ROLE");
			roles = msg.gConfig.selfAssignableRoles;
			if (!roles.includes(role.id)) return msg.channel.createMessage("this role is not listed as a self assignable role.");
			await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $pull: { selfAssignableRoles: role.id } });
			await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "removeSelfAssignableRole", role: role.id, timestamp: Date.now() });
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			const settings = {
				nsfw: "boolean",
				muteRole: "role",
				fResponse: "boolean",
				commandImages: "boolean",
				lang: "string",
				prefix: "string"
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

			if (msg.args.length === 0 || ["list", "ls"].some(s => msg.args[0].toLowerCase().indexOf(s) !== -1)) return msg.reply(`valid settings: **${Object.keys(settings).join("**, **")}**`);
			const c = msg.args[0].toLowerCase();
			const s = Object.values(settings)[Object.keys(settings).map(s => s.toLowerCase()).indexOf(c.toLowerCase())];
			const set = Object.keys(settings)[Object.keys(settings).map(s => s.toLowerCase()).indexOf(c.toLowerCase())];
			if (!Object.keys(settings).map(s => s.toLowerCase()).includes(c)) return msg.reply(`Invalid setting. You can use \`${msg.gConfig.settings.prefix}settings list\` to list settings.`);
			if (msg.args.length === 1) return msg.reply(`The setting ${set} is currently set to ${msg.gConfig.settings[set]}.`);
			else {
				let o;
				switch (s) {
					case "role":
						const r = await msg.getRoleFromArgs(1);
						o = msg.gConfig.settings[set];
						if (!r) return msg.errorEmbed("INVALID_ROLE");

						await msg.gConfig.edit({ settings: { [set]: r.id } });
						await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: set as any, oldValue: o, newValue: r.id, timestamp: Date.now() });
						return msg.reply(`Changed the setting **${set}** from "${o}" to "${r.id}".`);
						break;

					case "boolean":
						if (!Object.keys(booleanChoices).includes(msg.args[1].toLowerCase())) return msg.reply(`Invalid choice, must be one of "enabled", "disabled".`);
						o = msg.gConfig.settings[set];
						await msg.gConfig.edit({ settings: { [set]: booleanChoices[msg.args[1].toLowerCase()] } });
						await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: set as any, oldValue: o, newValue: booleanChoices[msg.args[1].toLowerCase()], timestamp: Date.now() });
						return msg.reply(`Changed the setting **${set}** from "${o ? "enabled" : "disabled"} to "${booleanChoices[msg.args[1].toLowerCase()] ? "enabled" : "disabled"}".`);
						break;

					case "string":
						o = msg.gConfig.settings[set];
						await msg.gConfig.edit({ settings: { [set]: msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" ") } });
						await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: set as any, oldValue: o, newValue: msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" "), timestamp: Date.now() });
						return msg.reply(`Changed the setting **${set}** from "${o}" to "${msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" ")}`);
						break;

				}
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			const o = msg.channel.topic;
			return msg.channel.edit({ topic: msg.unparsedArgs.join(" ") }, `Command: ${msg.author.username}#${msg.author.discriminator}`).then(async (c: Eris.TextChannel) => {
				await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editChannel", edit: "topic", oldValue: o, newValue: c.topic, channelId: c.id, reason: "topic command", timestamp: Date.now() });
				return msg.channel.createMessage(`Set the topic of <#${c.id}> to **${!c.topic ? "NONE" : c.topic}**`);
			});
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			const ch = await msg.getChannelFromArgs();
			if (!ch) return msg.errorEmbed("INVALID_CHANNEL");
			if (ch.name.indexOf("-") === -1) return msg.channel.createMessage("Channel name contains no dashes (-) to replace.");
			const o = ch.name;
			await ch.edit({
				name: ch.name.replace(/-/g, "\u2009\u2009")
			}, `${msg.author.username}#${msg.author.discriminator}: Spacify ${ch.name}`);
			await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editChannel", edit: "name", oldValue: o, newValue: ch.name, channelId: ch.id, reason: "spacify command", timestamp: Date.now() });
			return msg.channel.createMessage(`Spacified <#${ch.id}>!`);
		})
	});

export default null;
