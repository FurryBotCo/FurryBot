import * as Eris from "eris";
import Command from "./Command";
import Category from "./Category";
import CommandError from "./CommandError";
import CooldownHandler from "./CooldownHandler";
import CommandPermissionError from "./CommandPermissionError";
import config from "../../../config";
import ExtendedMessage from "../../../modules/extended/ExtendedMessage";
import { performance } from "perf_hooks";
import * as fs from "fs";
import { Logger } from "@donovan_dmc/ws-clusters";
import FurryBot from "@FurryBot";

type ArrayOneOrMore<T> = {
	0: T
} & T[];

type ErisPermissions =
	"createInstantInvite" | "kickMembers" | "banMembers" | "administrator" | "manageChannels" |
	"manageGuild" | "addReactions" | "readMessages" | "sendMessages" | "sendTTSMessages" |
	"manageMessages" | "embedLinks" | "attachFiles" | "readMessageHistory" | "mentionEveryone" |
	"externalEmojis" | "voiceConnect" | "voiceSpeak" | "voiceMuteMembers" | "voiceDeafenMembers" |
	"voiceMoveMembers" | "voiceUseVAD" | "changeNickname" | "manageNicknames" | "manageRoles" |
	"manageWebhooks" | "manageEmojis" |
	"all" | "allGuild" | "allText" | "allVoice"; // these are eris specific, not true permissions


export default class CommandHandler {
	private _client: FurryBot;
	private _commands: Command[];
	private _categories: Category[];
	private _options: {
		alwaysAddSend: boolean;
	};
	private _inHandler: true;
	private _cooldownHandler: CooldownHandler;
	constructor(client?: FurryBot, options?: {
		alwaysAddSend?: boolean;
	}) {
		this._client = client || null;
		this._commands = [];
		this._categories = [];
		if (!options) this._options = {
			alwaysAddSend: true
		};
		if (options) {
			this._options = {} as any;
			if (![undefined, null].includes(options.alwaysAddSend)) this._options.alwaysAddSend = options.alwaysAddSend;
			else this._options.alwaysAddSend = true;
		}
		this._inHandler = true;
		this._cooldownHandler = new CooldownHandler(this.commands);
	}

	setClient(client: any) {
		this._client = client;
	}

	get commands() {
		return [...this._commands];
	}

	get categories() {
		return [...this._categories];
	}

	private get options() {
		return { ...this._options };
	}

	get commandTriggers() {
		return this.commands.map(c => c.triggers).reduce((a, b) => a.concat(b));
	}

	get cooldownHandler() {
		return this._cooldownHandler;
	}

	addCommand(data: {
		triggers: ArrayOneOrMore<string>;
		userPermissions?: ErisPermissions[];
		botPermissions?: ErisPermissions[];
		cooldown?: number;
		donatorCooldown?: number;
		description?: string;
		usage?: string;
		features?: ("nsfw" | "devOnly" | "betaOnly" | "donatorOnly" | "guildOwnerOnly")[];
		subCommands?: Command[];
		category: Category | string;
		run: (msg: Eris.Message, cmd?: Command) => Promise<any>;
	}): this {
		if (!data.triggers || data.triggers.length < 1) throw new TypeError("invalid triggers provided");

		if (data.triggers.map(t => t.toLowerCase()).some(tr => this.commands.map(c => c.triggers).reduce((a, b) => a.concat(b), []).map(t => t.toLowerCase()).includes(tr))) {
			const d = this.commands.filter(c => c.triggers.map(t => t.toLowerCase()).some(t => data.triggers.map(tt => tt.toLowerCase()).includes(t)));

			let dup;
			if (!d) dup = "Unknown";
			else dup = d.map(c => c.triggers[0].toLowerCase()).join(", ");
			// Logger.log("Command Handler", this.commands.map(c => c.triggers).reduce((a, b) => a.concat(b), []).map(t => t.toLowerCase()));
			throw new TypeError(`duplicate command triggers with ${dup}, and ${data.triggers[0].toLowerCase()}`);
		}

		if (this.options.alwaysAddSend && data.botPermissions.indexOf("sendMessages") === -1) data.botPermissions.push("sendMessages");

		const cmd = new Command(false, data, this);
		this._commands.push(cmd);
		this._cooldownHandler.addCommand(cmd);
		return this;
	}

	addCategory(data: {
		name: string;
		displayName?: string;
		devOnly?: boolean;
		description?: string;
	}): this {
		if (this.categories.map(c => c.name.toLowerCase()).reduce((a, b) => a.concat(b), []).includes(data.name.toLowerCase())) throw new TypeError("duplicate category name");
		this._categories.push(new Category(data, this));
		return this;
	}

	getCommand(str: string) {
		if (!str) throw new TypeError("Missing command name");
		// console.log(this.commands);
		// console.log(this._commands);
		return this.commands.find(c => c.triggers.map(t => t.toLowerCase()).reduce((a, b) => a.concat(b), []).includes(str.toLowerCase())) || null;
	}

	getSubCommand(cmd: Command | string, str: string) {
		if (!cmd) throw new TypeError("No command provided");

		if (!(cmd instanceof Command)) cmd = this.getCommand(cmd);

		if (!cmd) throw new TypeError("Invalid command provided");

		if (!str) throw new TypeError("Missing subcommand name");

		return cmd.subCommands.find(c => c.triggers.map(t => t.toLowerCase()).includes(str.toLowerCase())) || null;
	}

	getCategory(str: string) {
		if (!str) throw new TypeError("Missing category name");
		return this.categories.find(c => c.name.toLowerCase() === str.toLowerCase()) || null;
	}

	getCategoryByCommand(cmd: string) {
		if (!cmd) throw new TypeError("Missing command name");
		return this.categories.find(c => c.commandTriggers.includes(cmd.toLowerCase())) || null;
	}

	deleteCommand(cmd: string): this {
		const c = this.getCommand(cmd);
		delete this._commands[this._commands.indexOf(c)];
		return this;
	}

	deleteCategory(cat: string): this {
		const c = this.getCategory(cat);
		delete this._categories[this._categories.indexOf(c)];
		return this;
	}

	async handleCommand(msg: ExtendedMessage): Promise<any> {
		if (!this._inHandler) throw new TypeError("Handle command called with invalid context.");
		if (!this._client) return Logger.warn("Command Handler", "Skipping command as client is not present in command handler.");
		const cmd: Command = this.getCommand(msg.cmd[0]);
		if (!cmd) return;

		/* begin blacklist check */

		let bl: boolean, blReason: {
			type: number;
			reason: string;
			blame: string;
		};

		if (typeof msg.uConfig.blacklist !== "undefined" && msg.uConfig.blacklist.blacklisted && !config.developers.includes(msg.author.id)) {
			bl = true;
			blReason = {
				type: 0,
				reason: msg.uConfig.blacklist.reason,
				blame: msg.uConfig.blacklist.blame
			};
		}

		if (msg.channel.type !== 1 && !bl && (typeof msg.gConfig.blacklist !== "undefined" && msg.gConfig.blacklist.blacklisted) && !config.developers.includes(msg.author.id)) {
			bl = true;
			blReason = {
				type: 1,
				reason: msg.gConfig.blacklist.reason,
				blame: msg.gConfig.blacklist.blame
			};
		}

		/* begin blacklist notice */
		if (bl) {
			let t;
			let v: string[];
			try {
				if (!fs.existsSync(`${__dirname}/../../../config/blNoticeViewed.json`)) fs.writeFileSync(`${__dirname}/../../../config/blNoticeViewed.json`, JSON.stringify([]));
				v = JSON.parse(fs.readFileSync(`${__dirname}/../../../config/blNoticeViewed.json`).toString());
			} catch (e) {
				Logger.error("Command Handler", `Failed to get blacklist notice viewed list`);
				v = null;
			}

			if (v === null || v.includes(msg.author.id)) return;
			else {
				v.push(msg.author.id);
				fs.writeFileSync(`${__dirname}/../../../config/blNoticeViewed.json`, JSON.stringify(v));
			}

			if (blReason.type === 0) t = `You are blacklisted from using this bot, reason: ${blReason.reason}, blame: ${blReason.blame}`;
			else t = `This server is blacklisted from using this bot, reason: ${blReason.reason}, blame: ${blReason.blame}`;

			if (msg.channel.permissionsOf(this._client.bot.user.id).has("sendMessages")) return msg.reply(t);
			else return msg.author.getDMChannel().then(ch => ch.createMessage(t)).catch(err => null);

		}

		/* end blacklist notice */
		/* end blacklist check */

		/* this._client.track("command", `command.${cmd.triggers[0]}`, {
			hostname: this._client.f.os.hostname(),
			beta: config.beta,
			clientId: config.bot.clientId,
			message: {
				id: msg.id,
				content: msg.content,
				mentionEveryone: msg.mentionEveryone,
				author: {
					id: msg.author.id,
					username: msg.author.username,
					discriminator: msg.author.discriminator
				},
				guild: {
					id: msg.channel.guild.id,
					name: msg.channel.guild.name,
					ownerId: msg.channel.guild.ownerID
				}
			},
			command: {
				subcommand: cmd.subcommand,
				triggers: cmd.triggers,
				userPermissions: cmd.userPermissions,
				botPermissions: cmd.botPermissions,
				cooldown: cmd.cooldown,
				donatorCooldown: cmd.donatorCooldown,
				description: cmd.description,
				usage: cmd.usage,
				features: cmd.features,
				subCommands: cmd.subCommands.map(c => c.triggers[0].toLowerCase()),
				category: cmd.category.name
			},
			executor: {
				id: msg.author.id,
				donator: msg.uConfig.patreon.donator,
				developer: config.developers.includes(msg.author.id)
			}
		}, new Date()); */

		if (!config.developers.includes(msg.author.id) && !msg.uConfig.blacklist.blacklisted) {
			this._client.spamCounter.push({
				time: Date.now(),
				user: msg.author.id,
				cmd: msg.cmd[0]
			});

			const sp = [...this._client.spamCounter.filter(s => s.user === msg.author.id)];
			let spC = sp.length;
			if (sp.length >= config.antiSpam.cmd.start && sp.length % config.antiSpam.cmd.warning === 0) {
				let report: any = {
					userTag: msg.author.tag,
					userId: msg.author.id,
					generatedTimestamp: Date.now(),
					entries: sp.map(s => ({ cmd: s.cmd, time: s.time })),
					type: "cmd",
					beta: config.beta
				};

				const d = fs.readdirSync(`${config.logsDir}/spam`).filter(d => !fs.lstatSync(`${config.logsDir}/spam/${d}`).isDirectory() && d.startsWith(msg.author.id) && d.endsWith("-cmd.json") && fs.lstatSync(`${config.logsDir}/spam/${d}`).birthtimeMs + 1.2e5 > Date.now());

				if (d.length > 0) {
					report = this._client.f.combineReports(...d.map(f => JSON.parse(fs.readFileSync(`${config.logsDir}/spam/${f}`).toString())), report);
					spC = report.entries.length;
					d.map(f => fs.unlinkSync(`${config.logsDir}/spam/${f}`));
				}

				const reportId = this._client.f.random(10);

				fs.writeFileSync(`${config.logsDir}/spam/${msg.author.id}-${reportId}-cmd.json`, JSON.stringify(report));

				await this._client.bot.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
					embeds: [
						{
							title: `Possible Command Spam From ${msg.author.tag} (${msg.author.id}) | VL: ${spC}`,
							description: `Report: ${config.beta ? `http://${config.apiBindIp}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`
						}
					],
					username: `Furry Bot Spam Logs${config.beta ? " - Beta" : ""}`,
					avatarURL: "https://assets.furry.bot/blacklist_logs.png"
				});

				if (spC >= config.antiSpam.cmd.blacklist) {
					await msg.uConfig.edit({
						blacklist: {
							blacklisted: true,
							reason: `Spamming Commands. Automatic Blacklist.`,
							blame: "Automatic"
						}
					});

					await this._client.bot.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
						embeds: [
							{
								title: "User Blacklisted",
								description: `Id: ${msg.author.id}\nTag: ${msg.author.tag}\nReason: Spamming Commands. Automatic Blacklist. Report: ${config.beta ? `http://${config.apiBindIp}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}\nBlame: Automatic`,
								timestamp: new Date().toISOString(),
								color: this._client.f.randomColor()
							}
						],
						username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
						avatarURL: "https://assets.furry.bot/blacklist_logs.png"
					});
				}

				return; // msg.reply(`It seems like you may be spamming commands, try to slow down a bit.. VL: ${spC}`);
			}
		}

		if (cmd.features.includes("betaOnly") && !config.beta) return;

		if (cmd.features.includes("devOnly") && !config.developers.includes(msg.author.id)) return msg.reply(`this command (**${cmd.triggers[0]}**) has been set to developer only, and you are not a developer of this bot, therefore you can not run this command.`);

		if (cmd.features.includes("guildOwnerOnly") && msg.author.id !== msg.channel.guild.ownerID && !config.developers.includes(msg.author.id)) return msg.reply("this command can only be ran by the servers owner.");

		if (cmd.features.includes("nsfw")) {
			if (!msg.channel.nsfw) return msg.reply("this command can only be ran in nsfw channels.", {
				file: await this._client.f.getImageFromURL("https://assets.furry.bot/nsfw.gif"),
				name: "nsfw.gif"
			});

			if (!msg.gConfig.nsfwEnabled) return msg.reply(`you must enable nsfw commands to use this, have a server administrator run \`${msg.gConfig.prefix}settings nsfw enabled\``);
		}

		if (cmd.userPermissions.length > 0 && !config.developers.includes(msg.author.id)) {
			if (cmd.userPermissions.some(perm => !msg.channel.permissionsOf(msg.author.id).has(perm))) {
				const p = cmd.userPermissions.filter(perm => !msg.channel.permissionsOf(msg.author.id).has(perm));

				const embed = {
					title: "You do not have the required permission(s) to use this!",
					description: `You require the permission(s) **${p.join("**, **")}** to run this, which you do not have.`,
					color: this._client.f.randomColor(),
					timestamp: new Date().toISOString()
				};
				Logger.warn("Command Handler", `user ${msg.author.tag} (${msg.author.id}) is missing the permission(s) ${p.join(", ")} to run the command ${cmd.triggers[0]}`);
				return msg.channel.createMessage({ embed })
					.catch(async (err) =>
						msg.author.getDMChannel()
							.then(dm =>
								dm.createMessage("I couldn't send messages in the channel you ran that in, please contact a server administrator.")
							)
					).catch(err => null);
			}
		}

		if (cmd.botPermissions.length > 0) {
			if (cmd.botPermissions.some(perm => !msg.channel.permissionsOf(this._client.bot.user.id).has(perm))) {
				const p = cmd.botPermissions.filter(perm => !msg.channel.permissionsOf(this._client.bot.user.id).has(perm));

				const embed = {
					title: "I do not have the required permission(s) to use this!",
					description: `I need the permission(s) **${p.join("**, **")}** for this command to function properly, please add these to me and try again.`,
					color: this._client.f.randomColor(),
					timestamp: new Date().toISOString()
				};
				Logger.warn("Command Handler", `I am missing the permission(s) ${p.join(", ")} for the command ${cmd.triggers[0]}, server: ${msg.channel.guild.name} (${msg.channel.guild.id})`);
				return msg.channel.createMessage({ embed })
					.catch(async (err) =>
						msg.author.getDMChannel()
							.then(dm =>
								dm.createMessage("I couldn't send messages in the channel you ran that in, please contact a server administrator.")
							)
					).catch(err => null);
			}
		}

		if (!config.developers.includes(msg.author.id)) {
			const cool = this.cooldownHandler.checkCooldown(cmd, msg.author.id);

			if (cool.c && cmd.cooldown !== 0 && !config.developers.includes(msg.author.id)) {
				let t = await this._client.f.ms(cool.time, true) as string;
				t = `${parseInt(t.split(" ")[0], 10)} ${t.split(" ")[1]}`;
				return msg.reply(`hey, this command is on cooldown! Please wait **${t}**..`);
			}
		}

		if (msg.gConfig.deleteCommands) await msg.delete().catch(() => msg.reply(`failed to delete command invocation. Please contact a server administrator. This can be disabled using \`${msg.gConfig.prefix}settings delCmds disable\``));

		if (cmd.cooldown !== 0 && !config.developers.includes(msg.author.id)) this.cooldownHandler.setCooldown(cmd, null, msg.author.id);

		const start = performance.now();
		Logger.log("Command Handler", `Command "${cmd.triggers[0]}" ran with arguments "${msg.unparsedArgs.join(" ")}" by ${msg.author.tag} (${msg.author.id}) in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`);
		const res = await cmd.run.call(this._client, msg, cmd).catch(err => err);
		const end = performance.now();

		Logger.debug("Command Handler", `Command handler for "${cmd.triggers[0]}" took ${(end - start).toFixed(3)}ms`);

		if (res instanceof Error && !(res instanceof CommandError) && (res.message !== "ERR_INVALID_USAGE" && res.name !== "ERR_INVALID_USAGE")) throw new CommandError(cmd, res);

		return res;
	}

	async handleSubCommand(cmnd: Command | string, msg: ExtendedMessage) {
		if (!this._client) return null;

		if (!cmnd) throw new TypeError("No command provided");

		if (!(cmnd instanceof Command)) cmnd = this.getCommand(cmnd);

		if (!cmnd) throw new TypeError("Invalid command provided");

		if (!msg) throw new TypeError("Message not provided");

		if (!(msg instanceof ExtendedMessage)) throw new TypeError("Invalid message provided");


		if (cmnd.subCommands.length === 0) return null;

		const c = msg.args.shift();

		if (!c) return "NOSUB";

		const cmd = this.getSubCommand(cmnd, c);

		if (!cmd) {
			msg.args.unshift(c);
			return "NOSUB";
		}

		if (cmd.features.includes("betaOnly") && !config.beta) return;

		if (cmd.features.includes("devOnly") && !config.developers.includes(msg.author.id)) return msg.reply(`this command (**${cmd.triggers[0]}**) has been set to developer only, and you are not a developer of this bot, therefore you can not run this command.`);

		if (cmd.features.includes("guildOwnerOnly") && msg.author.id !== msg.channel.guild.ownerID && !config.developers.includes(msg.author.id)) return msg.reply("this command can only be ran by the servers owner.");

		if (cmd.features.includes("nsfw")) {
			if (!msg.channel.nsfw) return msg.reply("this command can only be ran in nsfw channels.", {
				file: await this._client.f.getImageFromURL("https://assets.furry.bot/nsfw.gif"),
				name: "nsfw.gif"
			});

			if (!msg.gConfig.nsfwEnabled) return msg.reply(`you must enable nsfw commands to use this, have a server administrator run \`${msg.gConfig.prefix}settings nsfw enabled\``);
		}

		if (cmd.userPermissions.length > 0 && !config.developers.includes(msg.author.id)) {
			if (cmd.userPermissions.some(perm => !msg.channel.permissionsOf(msg.author.id).has(perm))) {
				const p = cmd.userPermissions.filter(perm => !msg.channel.permissionsOf(msg.author.id).has(perm));

				const embed = {
					title: "You do not have the required permission(s) to use this!",
					description: `You require the permission(s) **${p.join("**, **")}** to run this, which you do not have.`,
					color: this._client.f.randomColor(),
					timestamp: new Date().toISOString()
				};
				Logger.warn("Command Handler", `user ${msg.author.tag} (${msg.author.id}) is missing the permission(s) ${p.join(", ")} to run the command ${cmd.triggers[0]}`);
				return msg.channel.createMessage({ embed });
			}
		}

		if (cmd.botPermissions.length > 0 && !config.developers.includes(msg.author.id)) {
			if (cmd.userPermissions.some(perm => !msg.channel.permissionsOf(this._client.bot.user.id).has(perm))) {
				const p = cmd.botPermissions.filter(perm => !msg.channel.permissionsOf(this._client.bot.user.id).has(perm));

				const embed = {
					title: "I do not have the required permission(s) to use this!",
					description: `I need the permission(s) **${p.join("**, **")}** for this command to function properly, please add these to me and try again.`,
					color: this._client.f.randomColor(),
					timestamp: new Date().toISOString()
				};
				Logger.warn("Command Handler", `I am missing the permission(s) ${p.join(", ")} for the command ${cmd.triggers[0]}, server: ${msg.channel.guild.name} (${msg.channel.guild.id})`);
				return msg.channel.createMessage({ embed });
			}
		}

		const res = await cmd.run.call(this._client, msg, cmd).catch(err => err);

		if (res instanceof Error && !(res instanceof CommandError) && (res.message !== "ERR_INVALID_USAGE" && res.name !== "ERR_INVALID_USAGE")) throw new CommandError(cmd, res);

		return res;
	}
}
