import FurryBot from "../main";
import { ExtendedMessage, Permissions, eval as _eval } from "bot-stuff";
import config from "../config";
import { Logger } from "clustersv2";
import { CommandError, Command } from "command-handler";
import phin from "phin";
import util from "util";
import * as fs from "fs-extra";
import { mdb, mongo } from "../modules/Database";
import os from "os";
import * as Eris from "eris";
import { execSync } from "child_process";
import { performance } from "perf_hooks";
import CmdHandler from "../util/cmd";
import UserConfig from "../modules/config/UserConfig";
import GuildConfig from "../modules/config/GuildConfig";

CmdHandler
	.addCategory({
		name: "developer",
		displayName: ":tools: Developer",
		devOnly: true,
		description: "Commands to make development easier."
	})
	.addCommand({
		triggers: [
			"blacklist",
			"bl"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Manage the bots blacklist.",
		usage: "<add/check/list/remove> [user(s)/server(s)] [id] [reason]",
		features: ["devOnly"],
		category: "developer",
		subCommands: require("./developer-subcmd/blacklist").default,
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>, cmd: Command<ExtendedMessage<FurryBot, UserConfig, GuildConfig>, FurryBot>) {
			const sub = await CmdHandler.handleSubCommand(cmd, msg);
			if (sub !== "NOSUB") return sub;
			else return this.f.sendCommandEmbed(msg, cmd);
		})
	})
	.addCommand({
		triggers: [
			"dmuser"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Send a direct message to a user.",
		usage: "<id> <message>",
		features: ["devOnly"],
		category: "developer",
		subCommands: [],
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			if (msg.args.length > 0) return new CommandError(null, "ERR_INVALID_USAGE");

			const user = await msg.getUserFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			const dm = await user.getDMChannel();

			if (!dm) return msg.reply(`failed to fetch dm channel for **${user.username}#${user.discriminator}** (${user.id})`);

			const m = await dm.createMessage(msg.args.slice(1, msg.args.length).join(" "));

			if (!m) return msg.reply(`failed to dm **${user.username}#${user.discriminator}** (${user.id}), they might have their dms closed.`);

			return msg.reply(`sent direct message "${msg.args.slice(1, msg.args.length).join(" ")}" to **${user.username}#${user.discriminator}** (${user.id})`);
		})
	})
	.addCommand({
		triggers: [
			"eco"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Manage the bots economy.",
		usage: "",
		features: ["devOnly"],
		category: "developer",
		subCommands: require("./developer-subcmd/eco").default,
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>, cmd: Command<ExtendedMessage<FurryBot, UserConfig, GuildConfig>, FurryBot>) {
			const sub = await CmdHandler.handleSubCommand(cmd, msg);
			if (sub !== "NOSUB") return sub;
			else return this.f.sendCommandEmbed(msg, cmd);
		})
	})
	.addCommand({
		triggers: [
			"edit"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Edit stuff about the bot.",
		usage: "<icon/name/game/status>",
		features: ["devOnly"],
		category: "developer",
		subCommands: require("./developer-subcmd/edit").default,
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>, cmd: Command<ExtendedMessage<FurryBot, UserConfig, GuildConfig>, FurryBot>) {
			const sub = await CmdHandler.handleSubCommand(cmd, msg);
			if (sub !== "NOSUB") return sub;
			else return this.f.sendCommandEmbed(msg, cmd);
		})
	})
	.addCommand({
		triggers: [
			"eval",
			"exec",
			"ev",
			"e"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Evaluate code.",
		usage: "<code>",
		features: ["devOnly"],
		category: "developer",
		subCommands: [],
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			let silent = false;
			let error = false;
			let deleteInvoke = false;
			let ev = msg.unparsedArgs.join(" ");
			if (ev.indexOf("-s") !== -1) {
				silent = true;
				ev = ev.replace("-s", "");
			}
			if (ev.indexOf("-d") !== -1) {
				deleteInvoke = true;
				ev = ev.replace("-d", "");
			}
			const start = performance.now();
			let res;
			try {
				// an external functions is used because typescript screws with the context and the variables
				res = await _eval.call(this, ev, {
					config,
					msg,
					phin,
					functions: this.f,
					util,
					fs,
					mdb,
					mongo,
					Permissions,
					os
				});
			} catch (e) {
				res = e;
				error = true;
			}
			const end = performance.now();
			if (typeof res !== "string") {
				if (typeof res === "undefined") res = "No Return";
				// else if (res instanceof Array) res = res.join(" ");
				else if (typeof res === "object") res = util.inspect(res, { depth: 2, showHidden: true });
				else if (res instanceof Promise) res = await res;
				else if (res instanceof Function) res = res.toString();
				else if (res instanceof Buffer) res = res.toString();
				else res = res.toString();
			}


			if (res.indexOf(config.bot.token) !== -1) res = res.replace(new RegExp(config.bot.token, "g"), "[BOT TOKEN]");
			if (res.indexOf(config.universalKey) !== -1) res = res.replace(new RegExp(config.universalKey, "g"), "[UNIVERSAL KEY]");

			if (deleteInvoke) await msg.delete();

			if (!silent) {
				if (res.length > 1000) {
					const req = await phin({
						method: "POST",
						url: "https://pastebin.com/api/api_post.php",
						form: {
							api_dev_key: config.apis.pastebin.devKey,
							api_user_key: config.apis.pastebin.userKey,
							api_option: "paste",
							api_paste_code: res,
							api_paste_private: "2",
							api_paste_name: "Furry Bot Eval",
							api_paste_expire_date: "1D"
						}
					});
					res = `Uploaded ${req.body.toString()}`;
				}

				const embed: Eris.EmbedOptions = {
					title: `Evaluated in \`${(end - start).toFixed(3)}ms\``,
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					},
					timestamp: new Date().toISOString(),
					color: error ? 16711680 : this.f.randomColor(),
					fields: [
						{
							name: ":inbox_tray: Input",
							value: `\`\`\`js\n${ev}\`\`\``,
							inline: false
						},
						{
							name: ":outbox_tray: Output",
							value: `\`\`\`js\n${res}\`\`\``,
							inline: false
						}
					]
				};

				return msg.channel.createMessage({ embed });
			} else {
				if (res.length > 3000) {
					const req = await phin({
						method: "POST",
						url: "https://pastebin.com/api/api_post.php",
						form: {
							api_dev_key: config.apis.pastebin.devKey,
							api_user_key: config.apis.pastebin.userKey,
							api_option: "paste",
							api_paste_code: res,
							api_paste_private: "2",
							api_paste_name: "Furry Bot Silent Eval",
							api_paste_expire_date: "1D"
						}
					});
					res = `Uploaded ${req.body.toString()}`;
				}

				return Logger.log(`Silent eval return: ${res}`, msg.guild.shard.id);
			}
		})
	})
	.addCommand({
		triggers: [
			"leaveserver"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Make me leave a server.",
		usage: "<id>",
		features: ["devOnly"],
		category: "developer",
		subCommands: [],
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			let guild: Eris.Guild;

			if (msg.unparsedArgs.length === 0) guild = msg.guild;
			else {
				if (!this.bot.guilds.has(msg.unparsedArgs[0])) {
					return msg.channel.createMessage(`<@!${msg.author.id}>, Guild not found`);
				}

				guild = this.bot.guilds.get(msg.unparsedArgs[0]);
			}


			guild.leave().then(() => {
				return msg.channel.createMessage(`<@!${msg.author.id}>, Left guild **${guild.name}** (${guild.id})`);
			}).catch((err) => {
				return msg.channel.createMessage(`There was an error while doing this: ${err}`);
			});
		})
	})
	.addCommand({
		triggers: [
			"say"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Make me say something.",
		usage: "<text>",
		features: ["devOnly"],
		category: "developer",
		subCommands: [],
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			await msg.delete().catch(err => null);
			return msg.channel.createMessage(msg.unparsedArgs.join(" "));
		})
	})
	.addCommand({
		triggers: [
			"shell",
			"sh"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Execute shell code.",
		usage: "<code>",
		features: ["devOnly"],
		category: "developer",
		subCommands: [],
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			let silent = false;
			let error = false;
			let deleteInvoke = false;
			let ev = msg.unparsedArgs.join(" ");
			if (ev.indexOf("-s") !== -1) {
				silent = true;
				ev = ev.replace("-s", "");
			}
			if (ev.indexOf("-d") !== -1) {
				deleteInvoke = true;
				ev = ev.replace("-d", "");
			}
			const start = performance.now();
			let res;
			try {
				res = execSync(ev).toString();
			} catch (e) {
				res = e;
				error = true;
			}
			const end = performance.now();

			if (typeof res !== "string") {
				if (typeof res === "undefined") res = "No Return";
				// else if (res instanceof Array) res = res.join(" ");
				else if (typeof res === "object") res = util.inspect(res, { depth: 2, showHidden: true });
				else if (res instanceof Promise) res = await res;
				else if (res instanceof Function) res = res.toString();
				else if (res instanceof Buffer) res = res.toString();
				else res = res.toString();
			}

			if (deleteInvoke) await msg.delete();
			if (!silent) {

				if (res.length > 1000) {
					const req = await phin({
						method: "POST",
						url: "https://pastebin.com/api/api_post.php",
						form: {
							api_dev_key: config.apis.pastebin.devKey,
							api_user_key: config.apis.pastebin.userKey,
							api_option: "paste",
							api_paste_code: res,
							api_paste_private: "2",
							api_paste_name: "Furry Bot Shell Eval",
							api_paste_expire_date: "1D"
						}
					});
					res = `Uploaded ${req.body.toString()}`;
				}

				const embed: Eris.EmbedOptions = {
					title: `Evaluated in \`${(end - start).toFixed(3)}ms\``,
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					},
					timestamp: new Date().toISOString(),
					color: error ? 16711680 : this.f.randomColor(),
					fields: [
						{
							name: ":inbox_tray: Input",
							value: `\`\`\`bash\n${ev}\`\`\``,
							inline: false
						},
						{
							name: ":outbox_tray: Output",
							value: `\`\`\`bash\n${res}\`\`\``,
							inline: false
						}
					]
				};

				return msg.channel.createMessage({ embed });
			} else {
				if (res.length > 3000) {
					const req = await phin({
						method: "POST",
						url: "https://pastebin.com/api/api_post.php",
						form: {
							api_dev_key: config.apis.pastebin.devKey,
							api_user_key: config.apis.pastebin.userKey,
							api_option: "paste",
							api_paste_code: res,
							api_paste_private: "2",
							api_paste_name: "Furry Bot Silent Shell Eval",
							api_paste_expire_date: "1W"
						}
					});
					res = `Uploaded ${req.body.toString()}`;
				}

				return Logger.log(`Silent shell eval return: ${res}`, msg.guild.shard.id);
			}
		})
	})
	.addCommand({
		triggers: [
			"test"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Some stuff for testing",
		usage: "",
		features: ["devOnly"],
		category: "developer",
		subCommands: [],
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			if (!msg.args[0]) return msg.reply("tested..");

			switch (msg.args[0].toLowerCase()) {
				case "err":
					throw new Error("ERR_TESTING");
					break;

				default:
					return msg.reply("invalid test.");
			}
		})
	})
	.addCommand({
		triggers: [
			"reload",
			"rl"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Reload a module/command",
		usage: "<module/command>",
		features: ["devOnly"],
		category: "developer",
		subCommands: [],
		run: (async function (this: FurryBot, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) {
			if (msg.args.length < 1) throw new CommandError(null, "ERR_INVALID_USAGE");

			if (fs.existsSync(`${__dirname}/../handlers/events/client/${msg.args[0]}.${__filename.split(".").reverse()[0]}`)) {
				this.bot.removeAllListeners(msg.args[0]);

				delete require.cache[require.resolve(`${__dirname}/../handlers/events/client/${msg.args[0]}.${__filename.split(".").reverse()[0]}`)];

				const hn = require(`${__dirname}/../handlers/events/client/${msg.args[0]}.${__filename.split(".").reverse()[0]}`).default;

				this.bot.on(msg.args[0], hn.listener.bind(this));

				return msg.reply(`reloaded the **${msg.args[0]}** event.`);
			} else if (fs.existsSync(`${__dirname}/${msg.args[0].toLowerCase()}.${__filename.split(".").reverse()[0].toLowerCase()}`)) {
				delete require.cache[require.resolve(`${__dirname}/${msg.args[0].toLowerCase()}.${__filename.split(".").reverse()[0].toLowerCase()}`)];

				CmdHandler.commands.map(c => {
					if (c.category.name === msg.args[0].toLowerCase()) CmdHandler.deleteCommand(msg.args[0].toLowerCase());
				});

				CmdHandler.deleteCategory(msg.args[0].toLowerCase());

				require(`${__dirname}/${msg.args[0]}.${__filename.split(".").reverse()[0].toLowerCase()}`);

				return msg.reply(`reloaded the category **${msg.args[0].toLowerCase()}**`);
			}
		})
	});

export default null;
