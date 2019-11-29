import FurryBot from "@FurryBot";
import { ExtendedMessage } from "bot-stuff";
import config from "../config";
import * as Eris from "eris";
import { mdb } from "../modules/Database";
import chunk from "chunk";
import CmdHandler from "../util/cmd";
import { Logger } from "clustersv2";
import { CommandError } from "command-handler";
import UserConfig from "../modules/config/UserConfig";
import GuildConfig from "../modules/config/GuildConfig";
import { Warning } from "../util/types";

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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			let user: Eris.Member, embed, reason, m;
			// get member from message
			user = await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			if (msg.channel.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
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
			user.ban(1, `Ban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() =>
				msg.gConfig.modlog.add({ blame: this.bot.user.id, action: "ban", userId: user.id, reason, timestamp: Date.now() }).then(() =>
					msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was banned, ${reason}***`).catch(noerr => null)
				)
			).catch(async (err) => {
				msg.channel.createMessage(`I couldn't ban **${user.username}#${user.discriminator}**, ${err}`);
				if (m !== undefined) {
					await m.delete();
				}
			});
			if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) msg.delete().catch(error => null);
		})
	})
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
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
			msg.channel.guild.banMember(user.id, 7, `Hackban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() =>
				msg.gConfig.modlog.add({ blame: this.bot.user.id, action: "ban", userId: user.id, reason, timestamp: Date.now() }).then(() =>
					msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was banned, ${reason}***`).catch(noerr => null)
				)
			).catch(async (err) => {
				msg.channel.createMessage(`I couldn't hackban **${user.username}#${user.discriminator}**, ${err}`);
				/*if (m !== undefined) {
					await m.delete();
				}*/
			});

			if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) msg.delete().catch(error => null);
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
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
			user.kick(`Kick: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() =>
				msg.gConfig.modlog.add({ blame: this.bot.user.id, action: "kick", userId: user.id, reason, timestamp: Date.now() }).then(() =>
					msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was kicked, ${reason}***`).catch(noerr => null)
				)
			).catch(async (err) => {
				await msg.reply(`I couldn't kick **${user.username}#${user.discriminator}**, ${err}`);
				if (m !== undefined) {
					await m.delete();
				}
			});

			if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) msg.delete().catch(error => null);
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			let user, embed, reason, a, b;
			// get member from message
			user = await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			if (msg.gConfig.settings.muteRole === null) {
				embed = {
					title: "No mute role",
					description: `this server does not have a mute role set, you can set this with \`${msg.gConfig.settings.prefix}settings muteRole <role>\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
			if (!msg.channel.guild.roles.has(msg.gConfig.settings.muteRole)) {
				embed = {
					title: "Mute role not found",
					description: `The mute role specified for this server <@&${msg.gConfig.settings.muteRole}> (${msg.gConfig.settings.muteRole}) was not found, it has been reset. You can set a new one with \`${msg.gConfig.settings.prefix}settings muteRole <role>\``,
					color: 15601937
				};
				await msg.gConfig.edit({ settings: { muteRole: null } }).then(d => d.reload());
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
			a = this.f.compareMemberWithRole(msg.channel.guild.members.get(this.bot.user.id), msg.channel.guild.roles.get(msg.gConfig.settings.muteRole));
			if (a.higher || a.same) {
				embed = {
					title: "Invalid mute role",
					description: `The current mute role <@&${msg.gConfig.settings.muteRole}> (${msg.gConfig.settings.muteRole}) seems to be higher than me, please move it below me. You can set a new one with \`${msg.gConfig.settings.prefix}settings muteRole <role>\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}

			if (user.roles.includes(msg.gConfig.settings.muteRole)) {
				embed = {
					title: "User already muted",
					description: `The user **${user.username}#${user.discriminator}** seems to already be muted.. You can unmute them with \`${msg.gConfig.settings.prefix}unmute @${user.username}#${user.discriminator} [reason]\``,
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

			user.addRole(msg.gConfig.settings.muteRole, `Mute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() =>
				msg.gConfig.modlog.add({ blame: this.bot.user.id, action: "mute", userId: user.id, reason, timestamp: Date.now() }).then(() =>
					msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was muted, ${reason}***`).catch(noerr => null)
				)
			).catch(async (err) => {
				msg.channel.createMessage(`<@!${msg.author.id}>, I couldn't mute **${user.username}#${user.discriminator}**, ${err}`);
				/*if (m !== undefined) {
					await m.delete();
				}*/
			});
			if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) msg.delete().catch(error => null);
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			let user, embed, reason;
			// get member from message
			if (!msg.args[0]) return msg.channel.createMessage("Please provide a user id.");

			user = this.bot.users.has(msg.args[0]) ? this.bot.users.get(msg.args[0]) : await this.bot.getRESTUser(msg.args[0]).catch(error => false);

			if (!user) return msg.errorEmbed("INVALID_USER");

			if (msg.channel.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
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
			msg.channel.guild.unbanMember(user.id, `Unban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() =>
				msg.gConfig.modlog.add({ blame: this.bot.user.id, action: "unban", userId: user.id, reason, timestamp: Date.now() }).then(() =>
					msg.channel.createMessage(`***Unbanned ${user.username}#${user.discriminator}, ${reason}***`).catch(noerr => null)
				)
			).catch(async (err) => {
				msg.channel.createMessage(`I couldn't unban **${user.username}#${user.discriminator}**, ${err}`);
			});

			if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) msg.delete().catch(error => null);
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
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			let user, embed, reason, a;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");

			// get member from message
			user = await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			// if(user.id === msg.member.id && !msg.user.isDeveloper) return msg.channel.createMessage("Pretty sure you don't want to do this to yourthis.");
			// if(user.roles.highest.rawPosition >= msg.member.roles.highest.rawPosition && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`You cannot mute ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
			// if(user.permissions.has("administrator")) return msg.channel.createMessage("That user has `ADMINISTRATOR`, that would literally do nothing.");
			reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
			if (msg.gConfig.settings.muteRole === null) {
				embed = {
					title: "No mute role",
					description: `this server does not have a mute role set, you can set this with \`${msg.gConfig.settings.prefix}settings muteRole <role>\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
			if (!msg.channel.guild.roles.has(msg.gConfig.settings.muteRole)) {
				embed = {
					title: "Mute role not found",
					description: `The mute role specified for this server <@&${msg.gConfig.settings.muteRole}> (${msg.channel.guild.id}) was not found, it has been reset. You can set a new one with \`${msg.gConfig.settings.prefix}settings muteRole <role>\``,
					color: 15601937
				};
				await msg.gConfig.edit({ settings: { muteRole: null } }).then(d => d.reload());
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}
			a = this.f.compareMemberWithRole(msg.channel.guild.members.get(this.bot.user.id), msg.channel.guild.roles.get(msg.gConfig.settings.muteRole));
			if (a.higher || a.same) {
				embed = {
					title: "Invalid mute role",
					description: `The current mute role <@&${msg.gConfig.settings.muteRole}> (${msg.gConfig.settings.muteRole}) seems to be higher than me, please move it below me. You can set a new one with \`${msg.gConfig.settings.prefix}settings muteRole <role>\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}

			if (!user.roles.includes(msg.gConfig.settings.muteRole)) {
				embed = {
					title: "User not muted",
					description: `The user **${user.username}#${user.discriminator}** doesn't seem to be muted.. You can mute them with \`${msg.gConfig.settings.prefix}mute @${user.username}#${user.discriminator} [reason]\``,
					color: 15601937
				};
				Object.assign(embed, msg.embed_defaults("color"));
				return msg.channel.createMessage({ embed });
			}

			user.removeRole(msg.gConfig.settings.muteRole, `Mute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(() =>
				msg.gConfig.modlog.add({ blame: this.bot.user.id, action: "unmute", userId: user.id, reason, timestamp: Date.now() }).then(() =>
					msg.channel.createMessage(`***User ${user.username}#${user.discriminator} was unmuted, ${reason}***`).catch(noerr => null)
				)
			).catch(async (err) => {
				msg.channel.createMessage(`I couldn't unmute **${user.username}#${user.discriminator}**, ${err}`);
				/*if (m !== undefined) {
					await m.delete();
				}*/
			});
			if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) msg.delete().catch(error => null);
		})
	})
	.addCommand({
		triggers: [
			"warn"
		],
		userPermissions: [
			"kickMembers"
		],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Add a warning to someone.",
		usage: "<@member/id> [reason]",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			const member = await msg.getMemberFromArgs();

			if (!member) return msg.errorEmbed("INVALID_MEMBER");

			const reason = msg.args.length > 1 ? msg.args.slice(1).join(" ") : "None Provided";

			await mdb.collection("warnings").insertOne({
				blameId: msg.author.id,
				guildId: msg.channel.guild.id,
				userId: member.id,
				id: this.f.random(7),
				reason,
				date: Date.now()
			} as Warning);

			return msg.channel.createMessage(`Warned user **${member.username}#${member.discriminator}**, *${reason}*`);
		})
	})
	.addCommand({
		triggers: [
			"warnings"
		],
		userPermissions: [
			"kickMembers"
		],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Add a warning to someone.",
		usage: "<@member/id> [page]",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			const member = await msg.getMemberFromArgs();

			if (!member) return msg.errorEmbed("INVALID_MEMBER");

			const w: Warning[] = await mdb.collection("warnings").find({ userId: member.id, guildId: msg.channel.guild.id } as Warning).toArray().then((res: Warning[]) => res.sort((a, b) => a.date - b.date));

			const fields = chunk(await Promise.all(w.map(async (k: Warning, i) => {
				const u = await this.bot.getRESTUser(k.userId);
				return {
					name: `Warning #${i + 1}`,
					value: `Blame: ${u.username}#${u.discriminator}\nReason: ${k.reason}\nDate: ${new Date(k.date).toDateString()}\nID: ${k.id}`,
					inline: false
				};
			}, 5)));

			let p;
			if (msg.args.length > 1) {
				const pg = parseInt(msg.args[1], 10);
				if (isNaN(pg) || !pg || pg < 1 || pg > fields.length) return msg.reply("invalid page number.");
				p = pg;
			} else p = 1;

			const embed: Eris.EmbedOptions = {
				title: `Warnings for ${member.username}#${member.discriminator}`,
				fields: fields[p - 1],
				timestamp: new Date().toISOString(),
				color: this.f.randomColor()
			};

			return msg.channel.createMessage({
				embed
			});
		})
	})
	.addCommand({
		triggers: [
			"delwarning",
			"delwarn"
		],
		userPermissions: [
			"kickMembers"
		],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Delete a guild members warning.",
		usage: "<@member/id> <warning id>",
		features: [],
		category: "moderation",
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			if (msg.args.length > 2) return new Error("ERR_INVALID_USAGE");

			const member = await msg.getMemberFromArgs();

			if (!member) return msg.errorEmbed("INVALID_MEMBER");

			const w: Warning = await mdb.collection("warnings").findOne({ userId: member.id, guildId: msg.channel.guild.id, id: msg.args[1] } as Warning);

			if (!w) return msg.reply("invalid warning.");

			await mdb.collection("warnings").findOneAndDelete({ userId: member.id, guildId: msg.channel.guild.id, id: msg.args[1] } as Warning);

			const u = await this.bot.getRESTUser(w.blameId);

			const embed: Eris.EmbedOptions = {
				title: "Warning Deletion",
				description: `User: ${member.username}#${member.discriminator} (${member.id})\nReason: ${w.reason}\nBlame: ${u.username}#${u.discriminator} (${u.id})\nDate: ${new Date(w.date).toDateString()}`,
				timestamp: new Date().toISOString(),
				color: this.f.randomColor(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				}
			};

			return msg.channel.createMessage({
				embed
			});
		})
	});

export default null;
