import manager from "../../../index";
import FurryBot from "../../main";
import config from "../../config";
import functions from "../../util/functions";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import { mdb } from "../../modules/Database";
import * as Eris from "eris";
import GuildConfig from "../../modules/config/GuildConfig";
import UserConfig from "../../modules/config/UserConfig";
import { Command, CommandError } from "../../util/CommandHandler";
import CmdHandler from "../../util/cmd";

type CommandContext = FurryBot & { _cmd: Command };


/*
new Command(true, {
	triggers: [
		"server",
		"s",
		"guild",
		"g"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Add a server to the blacklist.",
	usage: "<id> <reason>",
	features: ["devOnly"],
	subCommands: [],
	category: null,
	run: (async function (this: FurryBot, msg: ExtendedMessage) {

	})
}, CmdHandler)
*/
export default [
	new Command(true, {
		triggers: [
			"add",
			"+"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Add a user/server to the blacklist.",
		usage: "<user/server> <id> [reason]",
		features: ["devOnly"],
		subCommands: [
			new Command(true, {
				triggers: [
					"server",
					"s",
					"guild",
					"g"
				],
				userPermissions: [],
				botPermissions: [],
				cooldown: 0,
				donatorCooldown: 0,
				description: "Add a server to the blacklist.",
				usage: "<id> <reason>",
				features: ["devOnly"],
				subCommands: [],
				category: null,
				run: (async function (this: FurryBot, msg: ExtendedMessage) {
					let id, srv: GuildConfig, blacklistReason, embed: Eris.EmbedOptions;
					if (msg.args.length < 1) return new CommandError(null, "ERR_INVALID_USAGE");
					id = msg.args[0];
					if (id.length < 17 || id.length > 18) return msg.reply(`**${id}** isn't a valid server id.`);
					srv = await mdb.collection("guilds").findOne({ id });
					if (!srv) {
						console.debug(`Created guild entry for ${id}`);
						await mdb.collection("guilds").insertOne({ ...config.defaults.guildConfig, ... { id } });
						srv = await mdb.collection("guilds").findOne({ id });
					}
					srv = new GuildConfig(srv.id, srv);
					if (!srv) return msg.reply(`Failed to create guild entry for **${id}**`);
					if (typeof srv.blacklist === "undefined") await srv.edit({ blacklist: { blacklisted: false, reason: null, blame: "" } }).then(d => d.reload());
					if (srv.blacklist.blacklisted) return msg.reply(`**${id}** is already blacklisted, reason: ${srv.blacklist.reason}.`);
					else {
						blacklistReason = msg.args.length > 1 ? msg.args.slice(1, msg.args.length).join(" ") : "No Reason Specified";
						await mdb.collection("guilds").findOneAndUpdate({ id }, { $set: { blacklist: { blacklisted: true, reason: blacklistReason, blame: msg.author.tag } } });
						embed = {
							title: "Server Blacklisted",
							description: `Id: ${id}\nReason: ${blacklistReason}\nBlame: ${msg.author.tag}`
						};
						Object.assign(embed, msg.embed_defaults());
						await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
							embeds: [embed],
							username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
							avatarURL: "https://assets.furry.bot/blacklist_logs.png"
						});
						return msg.reply(`Added **${id}** to the blacklist, reason: ${blacklistReason}.`);
					}
				})
			}, CmdHandler),
			new Command(true, {
				triggers: [
					"user",
					"u"
				],
				userPermissions: [],
				botPermissions: [],
				cooldown: 0,
				donatorCooldown: 0,
				description: "Add a user to the blacklist.",
				usage: "<id> <reason>",
				features: ["devOnly"],
				subCommands: [],
				category: null,
				run: (async function (this: FurryBot, msg: ExtendedMessage) {
					let u, id, blacklistReason, usr: UserConfig, embed: Eris.EmbedOptions;
					if (msg.args.length < 1) return new CommandError(null, "ERR_INVALID_USAGE");
					u = await msg.getUserFromArgs();
					if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
					id = u.id;
					usr = await mdb.collection("users").findOne({ id });
					if (!usr) {
						console.debug(`Created user entry for ${id}`);
						await mdb.collection("users").insertOne({ ...config.defaults.userConfig, ...{ id } });
						usr = await mdb.collection("users").findOne({ id });
					}

					if (!usr) return msg.reply(`Failed to create user entry for **${id}**`);
					if (usr.blacklist.blacklisted) return msg.reply(`**${id}** is already blacklisted, reason: ${usr.blacklist.reason}.`);
					else {
						blacklistReason = msg.args.length > 1 ? msg.args.slice(1, msg.args.length).join(" ") : "No Reason Specified";
						await mdb.collection("users").findOneAndUpdate({ id }, { $set: { blacklist: { blacklisted: true, reason: blacklistReason, blame: msg.author.tag } } });
						embed = {
							title: "User Blacklisted",
							description: `Id: ${id}\nTag: ${u.username}#${u.discriminator}\nReason: ${blacklistReason}\nBlame: ${msg.author.tag}`,
							timestamp: new Date().toISOString(),
							color: this.f.randomColor()
						};

						await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
							embeds: [embed],
							username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
							avatarURL: "https://assets.furry.bot/blacklist_logs.png"
						});
						return msg.reply(`Added **${u.username}#${u.discriminator}** (${id}) to the blacklist, reason: ${blacklistReason}.`);
					}
				})
			}, CmdHandler)
		],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			const sub = await this.cmdHandler.handleSubCommand(cmd, msg);
			if (sub !== "NOSUB") return sub;
			else return this.f.sendCommandEmbed(msg, cmd);
		})
	}, CmdHandler),
	new Command(true, {
		triggers: [
			"check"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Check if a user/server is blacklisted.",
		usage: "<user/server> <id>",
		features: ["devOnly"],
		subCommands: [
			new Command(true, {
				triggers: [
					"server",
					"s",
					"guild",
					"g"
				],
				userPermissions: [],
				botPermissions: [],
				cooldown: 0,
				donatorCooldown: 0,
				description: "Check if a serer is blacklisted.",
				usage: "<id>",
				features: ["devOnly"],
				subCommands: [],
				category: null,
				run: (async function (this: FurryBot, msg: ExtendedMessage) {
					let id, srv: GuildConfig;
					if (msg.args.length < 1) return new CommandError(null, "ERR_INVALID_USAGE");
					id = msg.args[0];
					if (id.length < 17 || id.length > 18) return msg.reply(`**${id}** isn't a valid server id.`);
					srv = await mdb.collection("guilds").findOne({ id });
					if (!srv) {
						console.debug(`Created guild entry for ${id}`);
						await mdb.collection("guilds").insertOne({ ...config.defaults.guildConfig, ...{ id } });
						srv = await mdb.collection("guilds").findOne({ id });
					}

					if (!srv) return msg.reply(`Failed to create guild entry for **${id}**`);
					if (srv.blacklist.blacklisted) return msg.reply(`**${id}** is blacklisted, reason: ${srv.blacklist.reason}.`);
					else return msg.reply(`**${id}** is not blacklisted.`);
				})
			}, CmdHandler),
			new Command(true, {
				triggers: [
					"user",
					"u"
				],
				userPermissions: [],
				botPermissions: [],
				cooldown: 0,
				donatorCooldown: 0,
				description: "Add  if a user is blacklisted.",
				usage: "<id>",
				features: ["devOnly"],
				subCommands: [],
				category: null,
				run: (async function (this: FurryBot, msg: ExtendedMessage) {
					let u, id, usr: UserConfig;
					if (msg.args.length < 1) return new CommandError(null, "ERR_INVALID_USAGE");
					u = await msg.getUserFromArgs();
					if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
					id = u.id;
					usr = await mdb.collection("users").findOne({ id });
					if (!usr) {
						console.debug(`Created user entry for ${id}`);
						await mdb.collection("users").insertOne({ ...config.defaults.userConfig, ...{ id } });
						usr = await mdb.collection("users").findOne({ id });
					}

					if (!usr) return msg.reply(`Failed to create user entry for **${id}**`);
					if (usr.blacklist.blacklisted) return msg.reply(`**${u.username}#${u.discriminator}** (${id}) is blacklisted, reason: ${usr.blacklist.reason}.`);
					else return msg.reply(`**${u.username}#${u.discriminator}** (${id}) is not blacklisted.`);
				})
			}, CmdHandler)],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			const sub = await this.cmdHandler.handleSubCommand(cmd, msg);
			if (sub !== "NOSUB") return sub;
			else return this.f.sendCommandEmbed(msg, cmd);
		})
	}, CmdHandler),
	new Command(true, {
		triggers: [
			"list",
			"ls"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "List user/server blacklist entries",
		usage: "<users/servers>",
		features: ["devOnly"],
		subCommands: [
			new Command(true, {
				triggers: [
					"server",
					"s",
					"guild",
					"g"
				],
				userPermissions: [],
				botPermissions: [],
				cooldown: 0,
				donatorCooldown: 0,
				description: "List the blacklisted servers.",
				usage: "",
				features: ["devOnly"],
				subCommands: [],
				category: null,
				run: (async function (this: FurryBot, msg: ExtendedMessage) {
					const entries: GuildConfig[] = await mdb.collection("guilds").find({ "blacklist.blacklisted": true }).toArray();

					if (entries.length === 0) return msg.reply("no entries found");
					const e = [];

					let page = 1;

					if (msg.args.length > 0) page = parseInt(msg.args[0], 10);

					for (const en of entries) {
						let s;
						if (this.guilds.has(en.id)) s = await this.bot.getRESTGuild(en.id);
						else s = null;

						if (!s) e.push(`\`${en.id}\` - ${en.blacklist.reason}`);
						else e.push(`\`${s.name}\` (\`${en.id}\`) - ${en.blacklist.reason}`);
					}

					const ee = [];

					let i = 0;
					for (const entry of e) {
						if ([undefined, null, ""].includes(ee[i])) ee[i] = [];

						if (ee[i].join("\n").length >= 1950 || ee[i].join("\n").length + entry.length >= 1950) i++;
						ee[i].push(entry);
					}

					if (ee.length === 0) return msg.reply("no entries found");

					if (page < 1 || page > ee.length) return msg.reply(`Invalid page number ${page}, valid: 1-${ee.length}`);

					const embed = {
						title: `Server Blacklist List ${page}/${ee.length}`,
						description: ee[page - 1].join("\n"),
						timestamp: new Date().toISOString(),
						color: this.f.randomColor()
					};
					return msg.channel.createMessage({ embed });
				})
			}, CmdHandler),
			new Command(true, {
				triggers: [
					"user",
					"u"
				],
				userPermissions: [],
				botPermissions: [],
				cooldown: 0,
				donatorCooldown: 0,
				description: "List the blacklisted users.",
				usage: "",
				features: ["devOnly"],
				subCommands: [],
				category: null,
				run: (async function (this: FurryBot, msg: ExtendedMessage) {
					const entries: UserConfig[] = await mdb.collection("users").find({ "blacklist.blacklisted": true }).toArray();

					if (entries.length === 0) return msg.reply("no entries found");

					const e = [];

					let page = 1;

					if (msg.args.length > 0) page = parseInt(msg.args[0], 10);

					for (const en of entries) {
						const s = await this.bot.getRESTUser(en.id);

						if (!s) e.push(`\`${en.id}\` - ${en.blacklist.reason}`);
						else e.push(`\`${s.username}#${s.discriminator}\` (\`${en.id}\`) - ${en.blacklist.reason}`);
					}

					const ee = [];

					let i = 0;
					for (const entry of e) {
						if ([undefined, null, ""].includes(ee[i])) ee[i] = [];

						if (ee[i].join("\n").length >= 1950 || ee[i].join("\n").length + entry.length >= 1950) i++;
						ee[i].push(entry);
					}

					if (page < 1 || page > ee.length) return msg.reply(`Invalid page number ${page}, valid: 1-${ee.length}`);

					const embed: Eris.EmbedOptions = {
						title: `User Blacklist List ${page}/${ee.length}`,
						description: ee[page - 1].join("\n"),
						timestamp: new Date().toISOString(),
						color: this.f.randomColor()
					};

					return msg.channel.createMessage({ embed });
				})
			}, CmdHandler)],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			const sub = await this.cmdHandler.handleSubCommand(cmd, msg);
			if (sub !== "NOSUB") return sub;
			else return this.f.sendCommandEmbed(msg, cmd);
		})
	}, CmdHandler),
	new Command(true, {
		triggers: [
			"remove",
			"-"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Remove users/servers from the blacklist.",
		usage: "<user/server> <id>",
		features: ["devOnly"],
		subCommands: [
			new Command(true, {
				triggers: [
					"server",
					"s",
					"guild",
					"g"
				],
				userPermissions: [],
				botPermissions: [],
				cooldown: 0,
				donatorCooldown: 0,
				description: "Remove a server from the blacklist.",
				usage: "<id> <reason>",
				features: ["devOnly"],
				subCommands: [],
				category: null,
				run: (async function (this: FurryBot, msg: ExtendedMessage) {
					let id, srv: GuildConfig, embed;
					if (msg.args.length < 1) return new CommandError(null, "ERR_INVALID_USAGE");
					id = msg.args[0];
					if (id.length < 17 || id.length > 18) return msg.reply(`**${id}** isn't a valid server id.`);
					srv = await mdb.collection("guilds").findOne({ id });
					if (!srv) {
						console.debug(`Created guild entry for ${id}`);
						await mdb.collection("guilds").insertOne({ ...config.defaults.guildConfig, ...{ id } });
						srv = await mdb.collection("guilds").findOne({ id });
					}
					srv = new GuildConfig(srv.id, srv);
					if (!srv) return msg.reply(`Failed to create guild entry for **${id}**`);
					if (typeof srv.blacklist === "undefined") await srv.edit({ blacklist: { blacklisted: false, reason: null, blame: "" } }).then(d => d.reload());
					if (!srv.blacklist.blacklisted) return msg.reply(`**${id}** is not blacklisted.`);
					else {
						await mdb.collection("guilds").findOneAndUpdate({ id }, { $set: { blacklist: { blacklisted: false, blame: null, reason: null } } });
						embed = {
							title: "Server Unblacklisted",
							description: `Id: ${id}\nPrevious Blacklist Reason: ${srv.blacklist.reason}\nBlame: ${msg.author.tag}`,
							timestamp: new Date().toISOString(),
							color: this.f.randomColor()
						};

						await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
							embeds: [embed],
							username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
							avatarURL: "https://assets.furry.bot/blacklist_logs.png"
						});
						return msg.reply(`Removed **${id}** from the blacklist, previous reason: ${srv.blacklist.reason}.`);
					}
				})
			}, CmdHandler),
			new Command(true, {
				triggers: [
					"user",
					"u"
				],
				userPermissions: [],
				botPermissions: [],
				cooldown: 0,
				donatorCooldown: 0,
				description: "Remove a user from the blacklist.",
				usage: "<id> <reason>",
				features: ["devOnly"],
				subCommands: [],
				category: null,
				run: (async function (this: FurryBot, msg: ExtendedMessage) {
					let u, id, usr: UserConfig, embed: Eris.EmbedOptions;
					if (msg.args.length < 1) return new CommandError(null, "ERR_INVALID_USAGE");
					u = await msg.getUserFromArgs();
					if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
					id = u.id;
					usr = await mdb.collection("users").findOne({ id });
					if (!usr) {
						console.debug(`Created user entry for ${id}`);
						await mdb.collection("users").insertOne({ ...config.defaults.userConfig, ...{ id } });
						usr = await mdb.collection("users").findOne({ id });
					}

					if (!usr) return msg.reply(`Failed to create user entry for **${id}**`);
					if (!usr.blacklist.blacklisted) return msg.reply(`**${id}** is not blacklisted`);
					else {
						await mdb.collection("users").findOneAndUpdate({ id }, { $set: { blacklist: { blacklisted: false, reason: null, blame: null } } });
						embed = {
							title: "User Unblacklisted",
							description: `Id: ${id}\nTag: ${u.username}#${u.discriminator}\nPrevious Reason: ${usr.blacklist.reason}\nBlame: ${msg.author.tag}`,
							timestamp: new Date().toISOString(),
							color: this.f.randomColor()
						};

						await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
							embeds: [embed],
							username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
							avatarURL: "https://assets.furry.bot/blacklist_logs.png"
						});
						return msg.reply(`Removed **${u.username}#${u.discriminator}** (${id}) from the blacklist, previous reason: ${usr.blacklist.reason}.`);
					}
				})
			}, CmdHandler)],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			const sub = await this.cmdHandler.handleSubCommand(cmd, msg);
			if (sub !== "NOSUB") return sub;
			else return this.f.sendCommandEmbed(msg, cmd);
		})
	}, CmdHandler)
];