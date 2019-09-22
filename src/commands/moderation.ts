import manager from "../../index";
import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import functions from "../util/functions";
import config from "../config";
import { Command, CommandError } from "../util/CommandHandler";
import * as Eris from "eris";
import { mdb } from "../modules/Database";
import UserConfig from "../modules/config/UserConfig";
import chunk from "chunk";
import CmdHandler from "../util/cmd";

type CommandContext = FurryBot & { _cmd: Command };

CmdHandler
	.addCategory({
		name: "moderation",
		displayName: ":hammer: Moderation",
		devOnly: false,
		description: "Stomp down the server baddies with your ban hammer."
	})
	.addCommand({
		triggers: [
			"ban",
			"b"
		],
		userPermissions: [
			"banMembers"
		],
		botPermissions: [
			"banMembers"
		],
		cooldown: 1e3,
		donatorCooldown: 1e3,
		description: "Ban members from your server.",
		usage: "<@member/id>",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let user: Eris.Member, embed, reason, m;
			// get member from message
			user = await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			if (msg.channel.permissionsOf(this.user.id).has("viewAuditLogs")) {
				if (await msg.channel.guild.getBans().then(res => res.map(u => u.user.id).includes(user.id))) {
					embed = {
						title: "User already banned",
						description: `It looks like ${user.username}#${user.discriminator} is already banned here..`
					};
					Object.assign(embed, msg.embed_defaults());
					return msg.channel.createMessage({ embed });
				}
			}

			if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.reply("Pretty sure you don't want to do this to yourself.");
			if (user.id === msg.guild.ownerID) return msg.reply("You cannot ban the server owner.");
			const a = this.f.compareMembers(user, msg.member);
			if ((a.member1.higher || a.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(`You cannot ban ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
			// if(!user.bannable) return msg.channel.createMessage(`<@!${msg.author.id}>, I cannot ban ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have ban permissions?`);
			reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
			if (!user.user.bot) m = await user.user.getDMChannel().then(dm => dm.createMessage(`You were banned from **${msg.channel.guild.name}**\nReason: ${reason}`));
			user.ban(1, `Ban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() => {
				msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was banned, ${reason}***`).catch(noerr => null);
			}).catch(async (err) => {
				msg.channel.createMessage(`I couldn't ban **${user.username}#${user.discriminator}**, ${err}`);
				if (m !== undefined) {
					await m.delete();
				}
			});
			if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
		})
	})
	/*.addCommand({
		triggers: [
			"clearwarnings"
		],
		userPermissions: [
			"kickMembers"
		],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Clear a users warnings",
		usage: "<@member/id>",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {

		})
	})
	.addCommand({
		triggers: [
			"delwarn",
			"rmwarn"
		],
		userPermissions: [
			"kickMembers"
		],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Remove a specific warning from some user.",
		usage: "<@member/id> <wid>",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length < 2) throw new CommandError(null, "ERR_INVALID_USAGE");
			let user, w, embed;
			// get member from message
			user = await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			if (!msg.args[1]) return msg.reply("Please provide a valid warning id as the second argument.");

			w = await mdb.collection("users").findOneAndUpdate({ id: user.id }, { $pull: { warnings: { wid: parseInt(msg.args[1], 10), gid: msg.channel.guild.id } } });
			if (!w.ok) {
				embed = {
					title: "Failure",
					description: `Either you provided an invalid warning id, or there was an internal error. Make sure the user **${user.username}#${user.discriminator}** has a warning with the id ${msg.args[1]}.`,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			} else {
				embed = {
					title: "Success",
					description: `Deleted warning #${msg.args[1]} for user **${user.username}#${user.discriminator}**.`,
					color: 41728
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
		})
	})
	.addCommand({
		triggers: [
			"fetchwarn",
			"fetchwarning"
		],
		userPermissions: [
			"kickMembers"
		],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Fetch a specific warning for a user.",
		usage: "<@member/id> <wid>",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length < 2) throw new CommandError(null, "ERR_INVALID_USAGE");
			let user, w, embed, usr, blame;
			// get member from message
			user = await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");
			if (!msg.args[1]) return msg.reply("Please provide a valid warning id as the second argument.");

			w = await mdb.collection("users").findOne({ id: user.id }).then(res => new UserConfig(msg.author.id, res)).then(res => res.warnings.filter(w => w.wid === parseInt(msg.args[1], 10) && w.gid === msg.channel.guild.id)[0]);
			if (!w) {
				embed = {
					title: "Failure",
					description: `Either you provided an invalid warning id, or there was an internal error. Make sure the user **${user.username}#${user.discriminator}** has a warning with the id ${msg.args[1]}, and that the warning is for this server.\n\n(tip: to list warnings use \`${msg.gConfig.prefix}warnlog ${user.username}#${user.discriminator}\`)`,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			} else {
				usr = await this.bot.getRESTUser(w.blame).catch(error => null);
				blame = !usr ? "Unknown#0000" : `${usr.username}#${usr.discriminator}`;
				embed = {
					title: `**${user.username}#${user.discriminator}** - Warning #${w.wid}`,
					description: `Blame: ${blame}\nReason: ${w.reason}\nTime: ${new Date(w.timestamp).toDateString()}`,
					color: 41728
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
		})
	})*/
	.addCommand({
		triggers: [
			"hackban",
			"hb"
		],
		userPermissions: [
			"banMembers"
		],
		botPermissions: [
			"banMembers"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Ban someone that isn't in your server.",
		usage: "<@user/id> [reason]",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let user: Eris.User, reason, embed;
			// get user from message
			user = await msg.getUserFromArgs();

			if (!user) user = await this.bot.getRESTUser(msg.args[0]).catch(err => null);
			if (!user) return msg.errorEmbed("INVALID_USER");

			if ((await msg.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) {
				embed = {
					title: "User already banned",
					description: `It looks like ${user.username}#${user.discriminator} is already banned here..`
				};
				Object.assign(embed, msg.embed_defaults());
				return msg.channel.createMessage({ embed });
			}

			if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.reply("Pretty sure you don't want to do this to yourself.");
			reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
			msg.channel.guild.banMember(user.id, 7, `Hackban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() => {
				msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was banned, ${reason}***`).catch(noerr => null);
			}).catch(async (err) => {
				msg.channel.createMessage(`I couldn't hackban **${user.username}#${user.discriminator}**, ${err}`);
				/*if (m !== undefined) {
					await m.delete();
				}*/
			});

			if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
		})
	})
	.addCommand({
		triggers: [
			"kick",
			"k"
		],
		userPermissions: [
			"kickMembers"
		],
		botPermissions: [
			"kickMembers"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Kick members from your server.",
		usage: "<@member/id> [reason]",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let user, reason, m, a;
			// get member from message
			user = await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.reply("Pretty sure you don't want to do this to yourself.");
			a = this.f.compareMembers(user, msg.member);
			if ((a.member2.higher || a.member2.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot kick ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
			// if(!user.kickable) return msg.channel.createMessage(`I cannot kick ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have kick permissions?`);
			reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
			if (!user.user.bot) m = await user.user.getDMChannel().then(dm => dm.createMessage(`You were kicked from **${msg.channel.guild.name}**\nReason: ${reason}`));
			user.kick(`Kick: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() => {
				msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was kicked, ${reason}***`).catch(noerr => null);
			}).catch(async (err) => {
				await msg.reply(`I couldn't kick **${user.username}#${user.discriminator}**, ${err}`);
				if (m !== undefined) {
					await m.delete();
				}
			});

			if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
		})
	})
	.addCommand({
		triggers: [
			"mute",
			"m"
		],
		userPermissions: [
			"kickMembers"
		],
		botPermissions: [
			"manageRoles"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Stop someone from chatting.",
		usage: "<@member/id> [reason]",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let user, embed, reason, a, b;
			// get member from message
			user = await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			if (msg.gConfig.muteRole === null) {
				embed = {
					title: "No mute role",
					description: `this server does not have a mute role set, you can set this with \`${msg.gConfig.prefix}setmuterole <role>\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
			if (!msg.channel.guild.roles.has(msg.gConfig.muteRole)) {
				embed = {
					title: "Mute role not found",
					description: `The mute role specified for this server <@&${msg.gConfig.muteRole}> (${msg.gConfig.muteRole}) was not found, it has been reset. You can set a new one with \`${msg.gConfig.prefix}setmuterole <role>\``,
					color: 15601937
				};
				await msg.gConfig.edit({ muteRole: null }).then(d => d.reload());
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
			a = this.f.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), msg.channel.guild.roles.get(msg.gConfig.muteRole));
			if (a.higher || a.same) {
				embed = {
					title: "Invalid mute role",
					description: `The current mute role <@&${msg.gConfig.muteRole}> (${msg.gConfig.muteRole}) seems to be higher than me, please move it below me. You can set a new one with \`${msg.gConfig.prefix}setmuterole <role>\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}

			if (user.roles.includes(msg.gConfig.muteRole)) {
				embed = {
					title: "User already muted",
					description: `The user **${user.username}#${user.discriminator}** seems to already be muted.. You can unmute them with \`${msg.gConfig.prefix}unmute @${user.username}#${user.discriminator} [reason]\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}

			if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.channel.createMessage(`${msg.author.id}>, Pretty sure you don't want to do this to yourself.`);
			b = this.f.compareMembers(user, msg.member);
			if ((b.member2.higher || b.member2.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot mute ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
			if (user.permission.has("administrator")) return msg.channel.createMessage(`<@!${msg.author.id}>, That user has the \`ADMINISTRATOR\` permission, that would literally do nothing.`);
			reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";

			user.addRole(msg.gConfig.muteRole, `Mute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() => {
				msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was muted, ${reason}***`).catch(noerr => null);
			}).catch(async (err) => {
				msg.channel.createMessage(`<@!${msg.author.id}>, I couldn't mute **${user.username}#${user.discriminator}**, ${err}`);
				/*if (m !== undefined) {
					await m.delete();
				}*/
			});
			if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
		})
	})
	.addCommand({
		triggers: [
			"setmuterole"
		],
		userPermissions: [
			"manageGuild"
		],
		botPermissions: [
			"manageChannels"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Set the role used to mute people.",
		usage: "<@role/id/name>",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length < 1) throw new CommandError(null, "ERR_INVALID_USAGE");

			let role, embed, g, a;
			if (msg.args[0] === "reset") {
				msg.channel.guild.channels.forEach(async (ch) => {
					if (![null, undefined, ""].includes(msg.gConfig.muteRole) && ch.permissionOverwrites.has(msg.gConfig.muteRole)) {
						await ch.deletePermission(msg.gConfig.muteRole).catch(err => null);
					}
				});

				await msg.gConfig.edit({ muteRole: null }).then(d => d.reload());
				return msg.channel.createMessage("Reset channel overwrites and mute role.");
			}
			// get role from message
			role = await msg.getRoleFromArgs();

			if (!role) return msg.errorEmbed("INVALID_ROLE");

			a = this.f.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), role);
			if (role.managed || role.rawPosition === 0 || a.higher || a.same) {
				embed = {
					title: "Invalid Role",
					description: `this role (<@&${role.id}>) cannot be used as the muted role, check that is not any of these:\n\t- The guilds \`everyone\` role\n\t- A bots role (generated when a bot is invited)\n\t- Higher than me`,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
			g = await msg.gConfig.edit({ muteRole: role.id }).then(d => d.reload());
			if (!g) {
				msg.channel.createMessage("There was an internal error while doing this, please try again");
				return this.logger.log(g, msg.guild.shard.id);
			}
			await msg.channel.createMessage(`Set the new muted role to **${role.name}**`);

			msg.channel.guild.channels.forEach(async (ch) => {
				await ch.editPermission(msg.gConfig.muteRole, null, 2048, "role").catch(err => null);
			});
		})
	})
	.addCommand({
		triggers: [
			"unban",
			"ub"
		],
		userPermissions: [
			"banMembers"
		],
		botPermissions: [
			"banMembers"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Remove bans for people that are already banned.",
		usage: "<id> [reason]",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let user, embed, reason;
			// get member from message
			if (!msg.args[0]) return msg.channel.createMessage("Please provide a user id.");

			user = this.users.has(msg.args[0]) ? this.users.get(msg.args[0]) : await this.bot.getRESTUser(msg.args[0]).catch(error => false);

			if (!user) return msg.errorEmbed("INVALID_USER");

			if (msg.channel.permissionsOf(this.user.id).has("viewAuditLogs")) {
				if (!(await msg.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) {
					embed = {
						title: "User not banned",
						description: `It doesn't look like ${user.username}#${user.discriminator} is banned here..`
					};
					Object.assign(embed, msg.embed_defaults());
					return msg.channel.createMessage({ embed });
				}
			}

			reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
			msg.channel.guild.unbanMember(user.id, `Unban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() => {
				msg.channel.createMessage(`***Unbanned ${user.username}#${user.discriminator}, ${reason}***`).catch(noerr => null);
			}).catch(async (err) => {
				msg.channel.createMessage(`I couldn't unban **${user.username}#${user.discriminator}**, ${err}`);
			});

			if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
		})
	})
	.addCommand({
		triggers: [
			"unmute",
			"um"
		],
		userPermissions: [
			"kickMembers"
		],
		botPermissions: [
			"manageRoles"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Remove a mute from someone.",
		usage: "<@member/id> [reason]",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let user, embed, reason, a;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");

			// get member from message
			user = await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			// if(user.id === msg.member.id && !msg.user.isDeveloper) return msg.channel.createMessage("Pretty sure you don't want to do this to yourthis.");
			// if(user.roles.highest.rawPosition >= msg.member.roles.highest.rawPosition && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`You cannot mute ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
			// if(user.permissions.has("administrator")) return msg.channel.createMessage("That user has `ADMINISTRATOR`, that would literally do nothing.");
			reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
			if (msg.gConfig.muteRole === null) {
				embed = {
					title: "No mute role",
					description: `this server does not have a mute role set, you can set this with \`${msg.gConfig.prefix}setmuterole <role>\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
			if (!msg.channel.guild.roles.has(msg.gConfig.muteRole)) {
				embed = {
					title: "Mute role not found",
					description: `The mute role specified for this server <@&${msg.gConfig.muteRole}> (${msg.channel.guild.id}) was not found, it has been reset. You can set a new one with \`${msg.gConfig.prefix}setmuterole <role>\``,
					color: 15601937
				};
				await msg.gConfig.edit({ muteRole: null }).then(d => d.reload());
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
			a = this.f.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), msg.channel.guild.roles.get(msg.gConfig.muteRole));
			if (a.higher || a.same) {
				embed = {
					title: "Invalid mute role",
					description: `The current mute role <@&${msg.gConfig.muteRole}> (${msg.gConfig.muteRole}) seems to be higher than me, please move it below me. You can set a new one with \`${msg.gConfig.prefix}setmuterole <role>\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}

			if (!user.roles.includes(msg.gConfig.muteRole)) {
				embed = {
					title: "User not muted",
					description: `The user **${user.username}#${user.discriminator}** doesn't seem to be muted.. You can mute them with \`${msg.gConfig.prefix}mute @${user.username}#${user.discriminator} [reason]\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}

			user.removeRole(msg.gConfig.muteRole, `Mute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() => {
				msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was unmuted, ${reason}***`).catch(noerr => null);
			}).catch(async (err) => {
				msg.channel.createMessage(`I couldn't unmute **${user.username}#${user.discriminator}**, ${err}`);
				/*if (m !== undefined) {
					await m.delete();
				}*/
			});
			if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
		})
	})
	/*.addCommand({
		triggers: [
			"warn",
			"w"
		],
		userPermissions: [
			"kickMembers"
		],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Warn a user for something they've done.",
		usage: "<@member/id> <reason>",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let user, reason, w, u, embed, a;
			if (msg.args.length < 2) throw new CommandError(null, "ERR_INVALID_USAGE");
			// get member from message
			user = await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");
			u = await mdb.collection("users").findOne({ id: user.id }).then(res => new UserConfig(msg.author.id, res));
			a = this.f.compareMembers(user, msg.member);
			if (user.id === msg.member.id && !msg.user.isDeveloper) return msg.channel.createMessage("Pretty sure you don't want to do this to yourthis.");
			if ((a.member1.higher || a.member1.same) && msg.author.id !== msg.channel.guild.ownerID && !msg.user.isDeveloper) return msg.channel.createMessage(`You cannot warn ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
			reason = msg.args.slice(1).join(" ");

			if (!reason) return msg.channel.createMessage("Please provide a reason.");

			w = await mdb.collection("users").findOneAndUpdate({ id: user.id }, { $push: { warnings: { wid: u.warnings.length + 1, blame: msg.author.id, reason, timestamp: Date.now(), gid: msg.channel.guild.id } } });
			if (!msg.gConfig.deleteCommands && msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
			embed = {
				title: `User Warned - #${u.warnings.length + 1}`,
				description: `User ${user.username}#${user.discriminator} was warned by ${msg.author.username}#${msg.author.discriminator}`,
				fields: [
					{
						name: "Reason",
						value: reason,
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
			"warnlog"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Check the warnings a user has.",
		usage: "<@member/id> [page]",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let user, page, mn, warnings, embed, wr, pages, fields, w, usr, blame;

			// this code is awful, but I can't be bothered to rewrite it right now
			if (msg.args.length === 0 || !msg.args || (!msg.args[0] && msg.args[0].length < 17)) {
				user = msg.member;
				page = ![undefined, null, ""].includes(msg.args[0]) && !msg.args[0] && msg.args[0].length < 17 ? msg.args[0] : 1;
			} else {
				if (![undefined, null, ""].includes(msg.args[0]) && msg.args[0] && msg.args[0].length >= 17) {
					page = msg.args[0];
					mn = 1;
				} else {
					page = ![undefined, null, ""].includes(msg.args[0]) && !msg.args[0] && msg.args[0].length < 17 ? msg.args[0] : 1; // lgtm [js/useless-assignment-to-message]
				}

				if (![undefined, null, ""].includes(msg.args[1]) && msg.args[1] && msg.args[1].length >= 17) {
					page = msg.args[1];
					mn = 0;
				} else {
					page = ![undefined, null, ""].includes(msg.args[1]) && !msg.args[1] && msg.args[1].length < 17 ? msg.args[1] : 1;
				}

				if (!mn) mn = 1;

				user = await msg.getMemberFromArgs(mn);
			}


			if (!user) return msg.errorEmbed("INVALID_USER");

			warnings = await mdb.collection("users").findOne({ id: user.id }).then(res => new UserConfig(msg.author.id, res)).then(res => res.warnings.filter(w => w.gid === msg.channel.guild.id).sort((s, g) => s.wid < g.wid ? -1 : s.wid > g.wid ? 1 : 0).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
			if (warnings.length <= 0) {
				embed = {
					title: "No Warnings Found",
					description: `No warnings were found for the specified user **${user.username}#${user.discriminator}**`,
					color: 41728
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });

			}
			wr = chunk(warnings, 10);
			pages = wr.length;
			if ([undefined, null, ""].includes(page)) page = 1;
			if (page > pages) return msg.channel.createMessage("Invalid page number.");
			fields = [];
			for (const key in wr[page - 1]) {
				w = wr[page - 1][key];
				usr = await this.bot.getRESTUser(w.blame);
				blame = !usr ? "Unknown" : `${usr.username}#${usr.discriminator}`;
				fields.push({
					name: `#${w.wid} - ${new Date(w.timestamp).toDateString()} by **${blame}**`,
					value: w.reason,
					inline: false
				});
			}
			embed = {
				title: `Warn Log for **${user.username}#${user.discriminator}** - Page ${page}/${pages}`,
				fields
			};
			Object.assign(embed, msg.embed_defaults());
			msg.channel.createMessage({ embed });
		})
	})*/;

export default null;