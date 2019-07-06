import ClientEvent from "@modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Permissions from "@util/Permissions";
import functions, { ErrorHandler } from "@util/functions";
import { performance } from "perf_hooks";
import config from "@config";
import { mdb } from "@modules/Database";
import * as os from "os";
import phin from "phin";
import * as fs from "fs";

export default new ClientEvent("messageCreate", (async function (this: FurryBot, message: Eris.Message) {
	const msg: ExtendedMessage = new ExtendedMessage(message, this);
	await msg._load.call(msg);

	if (msg.author.bot) return;

	let embed: Eris.EmbedOptions, bl: boolean, blReason: {
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

	if (!bl && (typeof msg.gConfig.blacklist !== "undefined" && msg.gConfig.blacklist.blacklisted) && !config.developers.includes(msg.author.id)) {
		bl = true;
		blReason = {
			type: 1,
			reason: msg.gConfig.blacklist.reason,
			blame: msg.gConfig.blacklist.blame
		};
	}

	try {

		if (msg.channel.type === 1 && !bl) {

			let dmAds;
			// dm advertising to bot
			if (/discord\.gg/gi.test(msg.content.toLowerCase())) {
				dmAds = true;
				const c = await this.getRESTGuild(config.bot.mainGuild);
				await c.banMember(msg.author.id, 0, "Advertising in bots dms.");

				embed = {
					title: `DM Advertisment from ${msg.author.tag} (${msg.author.id})`,
					description: "User auto banned.",
					fields: [{
						name: "Content",
						value: msg.content,
						inline: false
					}]
				};

				await this.executeWebhook(config.webhooks.directMessage.id, config.webhooks.directMessage.token, {
					embeds: [embed],
					username: `Direct Messages${config.beta ? " - Beta" : ""}`
				});

				await msg.author.getDMChannel().then(dm => dm.createMessage("Hey, I see that you're sending dm advertisments dm me, that isn't a good idea.. You've been auto banned from my support server for dm advertising."));
				return this.logger.log(`DM Advertisment recieved from ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`);
			} else {
				dmAds = false;
				embed = {
					title: `Direct Message from ${msg.author.tag} (${msg.author.id})`,
					fields: [{
						name: "Content",
						value: msg.content,
						inline: false
					}]
				};

				await this.executeWebhook(config.webhooks.directMessage.id, config.webhooks.directMessage.token, {
					embeds: [embed],
					username: `Direct Messages${config.beta ? " - Beta" : ""}`
				});

				await msg.author.getDMChannel().then(dm => dm.createMessage(`Hey, I see you messaged me! Here's some quick tips:\n\nYou can go to <https://furry.bot> to see our website, use \`${config.defaultPrefix}help\` to see my commands, and join <https://furry.bot/inv> if you need more help!\nAnother tip: commands cannot be ran in my dms!`));
				return this.logger.log(`Direct message recieved from ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`);
			}


			if (dmAds) return;
		}

		if ([`<@!${this.user.id}>`, `<@${this.user.id}>`].includes(msg.content) && !bl) {
			const p = [
				"kickMembers",
				"banMembers",
				"manageChannels",
				"manageGuild",
				"addReactions",
				"viewAduitLog",
				"voicePrioritySpeaker",
				"readMessages",
				"sendMessages",
				"manageMessages",
				"embedLinks",
				"attachFiles",
				"readMessageHistory",
				"externalEmojis",
				"voiceConnect",
				"voiceSpeak",
				"voiceMuteMembers",
				"voiceDeafenMembers",
				"voiceMoveMembers",
				"voiceuserVAD",
				"changeNickname",
				"manageNicknames",
				"manageRoles"
			];
			const botPerms = p.map(perm => Permissions.constant[perm]).reduce((a, b) => a + b);

			const embed: Eris.EmbedOptions = {
				title: "Hi, I'm your little friend, Furry Bot!",
				color: functions.randomColor(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				timestamp: new Date().toISOString(),
				description: `\
	Hi, ${msg.author.tag}! Since you've mentioned me, here's a little about me:\n\
	My prefix here is ${msg.gConfig.prefix}, you can see my commands by using \`${msg.gConfig.prefix}help\`, you can change this by using \`${msg.gConfig.prefix}prefix <new prefix>\`\n\
	If you want to invite me to another server, you can use [this link](https://discordapp.com/oauth2/authorize?client_id=${this.user.id}&scope=bot&permissions=${botPerms}), or, if that isn't working, you can visit [https://furry.bot/add](https://furry.bot/add)\n\
	If you need some help with me, you can visit my support server [here](https://furry.bot/inv)`
			};

			if (!msg.channel.permissionsOf(this.user.id).has("sendMessages")) {
				return msg.author.getDMChannel().then(dm => dm.createMessage({
					content: "I couldn't send messages in the channel where I was mentioned, so I sent this directly to you!",
					embed
				})).catch(error => null);
			} else if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) {
				return msg.channel.createMessage(`${embed.title}\n${embed.description}\n(If you give me permission to embed links this would look a lot nicer)`);
			} else {
				return msg.channel.createMessage({
					embed
				});
			}
		}

		if (!msg.content.startsWith(msg.prefix)) return;

		if (msg.cmd !== null && msg.cmd.command !== null && msg.cmd.command.length > 0) {

			if (bl) {
				let t;
				let v: string[];
				try {
					if (!fs.existsSync(`${__dirname}/../../../config/blNoticeViewed.json`)) fs.writeFileSync(`${__dirname}/../../../config/blNoticeViewed.json`, JSON.stringify([]));
					v = JSON.parse(fs.readFileSync(`${__dirname}/../../../config/blNoticeViewed.json`).toString());
				} catch (e) {
					console.error(`Failed to get blacklist notice viewed list`);
					v = null;
				}

				if (v === null || v.includes(msg.author.id)) return;
				else {
					v.push(msg.author.id);
					fs.writeFileSync(`${__dirname}/../../../config/blNoticeViewed.json`, JSON.stringify(v));
				}

				if (blReason.type === 0) t = `You are blacklisted from using this bot, reason: ${blReason.reason}, blame: ${blReason.blame}`;
				else t = `This server is blacklisted from using this bot, reason: ${blReason.reason}, blame: ${blReason.blame}`;

				if (msg.channel.permissionsOf(this.user.id).has("sendMessages")) return msg.reply(t);
				else return msg.author.getDMChannel().then(ch => ch.createMessage(t)).catch(err => null);

			}

			const [cmd] = msg.cmd.command;

			if (!msg.channel.permissionsOf(this.user.id).has("readMessages")) return msg.author.getDMChannel().then(dm => dm.createMessage("I am missing the `readMessages` permission to run the command you tried to run.").catch(err => null));
			if (!msg.channel.permissionsOf(this.user.id).has("sendMessages")) return msg.author.getDMChannel().then(dm => dm.createMessage("I am missing the `sendMessages` permission to run the command you tried to run.").catch(err => null));

			// if (msg.cmd.category.name === "custom" && msg.channel.guild.id !== config.bot.mainGuild) return msg.reply("This command cannot be ran in this server!");

			if (cmd.devOnly && !config.developers.includes(msg.author.id)) return msg.reply("You cannot run this command as you are not a developer of this bot.");

			if (cmd.guildOwnerOnly && (msg.author.id !== msg.guild.ownerID) && !config.developers.includes(msg.author.id)) return msg.reply("This command can only be ran by the owner of this server.");

			if (cmd.nsfw) {
				if (!msg.channel.nsfw) return msg.reply("This command can only be ran in nsfw channels.", {
					file: await functions.getImageFromURL("https://assets.furry.bot/nsfw.gif"),
					name: "nsfw.gif"
				});
				if (!msg.gConfig.nsfwEnabled) return msg.reply(`You must enable nsfw commands to use this, have a server administrator run \`${msg.gConfig.prefix}togglensfwcommands\``);

				if (![undefined, null, ""].includes(msg.channel.topic) && config.yiff.disableStatements.some(y => msg.channel.topic.trim().indexOf(y) !== -1)) {
					const t = config.yiff.disableStatements.filter(y => msg.channel.topic.trim().indexOf(y) !== -1);
					let txt;
					if (t.length === 1) txt = t[0];
					else {
						const tmp = t.pop();
						txt = `${t.join("**, **")}**, and **${tmp}`;
					}
					embed = {
						title: "NSFW command explicitiy disabled in this channel",
						description: `NSFW commands have been explicitly disabled in this channel, ask a server moderator/administrator to remove **${txt}** from the channel topic.`,
						color: functions.randomColor(),
						timestamp: new Date().toISOString()
					};

					return msg.channel.createMessage({ embed });
				}
			}

			if (cmd.userPermissions.length > 0 && !config.developers.includes(msg.author.id)) {
				if (cmd.userPermissions.some(perm => !msg.channel.permissionsOf(msg.author.id).has(perm))) {
					const p = cmd.userPermissions.filter(perm => !msg.channel.permissionsOf(msg.author.id).has(perm));

					embed = {
						title: "You do not have the required permission(s) to use this!",
						description: `You require the permission(s) **${p.join("**, **")}** to run this, which you do not have.`,
						color: functions.randomColor(),
						timestamp: new Date().toISOString()
					};
					this.logger.debug(`user ${msg.author.tag} (${msg.author.id}) is missing the permission(s) ${p.join(", ")} to run the command ${cmd.triggers[0]}`);
					return msg.channel.createMessage({ embed });
				}
			}

			if (cmd.botPermissions.length > 0 && !config.developers.includes(msg.author.id)) {
				if (cmd.userPermissions.some(perm => !msg.channel.permissionsOf(this.user.id).has(perm))) {
					const p = cmd.botPermissions.filter(perm => !msg.channel.permissionsOf(this.user.id).has(perm));

					embed = {
						title: "I do not have the required permission(s) to use this!",
						description: `I need the permission(s) **${p.join("**, **")}** for this command to function properly, please add these to me and try again.`,
						color: functions.randomColor(),
						timestamp: new Date().toISOString()
					};
					this.logger.debug(`I am missing the permission(s) ${p.join(", ")} for the command ${cmd.triggers[0]}, server: ${msg.channel.guild.name} (${msg.channel.guild.id})`);
					return msg.channel.createMessage({ embed });
				}
			}

			if (this.commandTimeout[cmd.triggers[0]].has(msg.author.id) && !config.developers.includes(msg.author.id)) {
				this.logger.log(`Command timeout encountered by user ${msg.author.tag} (${msg.author.id}) on command "${cmd.triggers[0]}" in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`);

				return msg.channel.createMessage(`<@!${msg.author.id}>, <:cooldown:591863995057831946>\nPlease wait ${functions.ms(cmd.cooldown)} before using this command again!`);
			}

			let lang;

			if (!msg.gConfig.lang) await msg.gConfig.edit({ lang: "en" }).then(d => d.reload());

			if (!config.lang[msg.gConfig.lang.toLowerCase()]) {
				await msg.reply("This server appears to have an invalid language configuration, defaulting to english.");
				lang = config.lang.en;
			} else lang = config.lang[msg.gConfig.lang.toLowerCase()];

			if (Object.keys(lang).includes(cmd.triggers[0])) {
				const l = lang[cmd.triggers[0]];
				msg.c = l[Math.floor(Math.random() * l.length)];
			} else msg.c = null;

			this.commandTimeout[cmd.triggers[0]].add(msg.author.id);
			setTimeout((cmd, user) => {
				this.commandTimeout[cmd].delete(user);
			}, cmd.cooldown, cmd.triggers[0], msg.author.id);

			if (msg.gConfig.deleteCommands) msg.delete().catch(err => msg.reply(`Failed to delete command invocation, you can disable this by running \`${msg.gConfig.prefix}delcmds\``));
			this.logger.command(`Command  "${cmd.triggers[0]}" ran with arguments "${msg.unparsedArgs.join(" ")}" by user ${msg.author.tag} (${msg.author.id}) in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`);
			const start = performance.now();
			const c = await cmd.run.call(this, msg);
			const end = performance.now();
			this.logger.debug(`Command handler for "${cmd.triggers[0]}" took ${(end - start).toFixed(3)}ms to execute.`);
			if (c instanceof Error) throw c;
			return;
		}
	} catch (e) {
		const err: Error = e; // typescript doesn't allow annotating of catch clause variables, ts-1196
		let embed: Eris.EmbedOptions, num: string, code: string, stack: string;

		switch (err.message.toUpperCase()) {
			case "ERR_INVALID_USAGE":
				embed = {
					title: ":x: Invalid Command Usage",
					color: 15601937,
					fields: [{
						name: "Command",
						value: msg.cmd.command.map(t => t.triggers[0]).join(" "),
						inline: false
					}, {
						name: "Usage",
						value: `${msg.gConfig.prefix}${msg.cmd.command.map(t => t.triggers[0]).join(" ")} ${msg.cmd.command[msg.cmd.command.length - 1].usage}`,
						inline: false
					}, {
						name: "Description",
						value: msg.cmd.command[msg.cmd.command.length - 1].description,
						inline: false
					}, {
						name: "Category",
						value: typeof msg.cmd.category !== "undefined" && typeof msg.cmd.category.name !== "undefined" ? this.ucwords(msg.cmd.category.name) : "Unknown",
						inline: false
					}, {
						name: "Arguments Provided",
						value: msg.args.length !== 0 ? msg.args.join(" ") : "NONE",
						inline: false
					}
						/*,{
							name: "Documentation Link",
							value: `${config.bot.documentationURL}#command/${command.triggers[0]}`,
							inline: false
						}*/
						// removed due to help being moved fully into bot commands
					]
				};
				return msg.channel.createMessage({
					embed
				});
				break; // eslint-disable-line no-unreachable

			case "HELP":
				return functions.sendCommandEmbed(msg, msg.cmd.command);
				break; // eslint-disable-line no-unreachable

			default:
				// internal error handling
				const er = ErrorHandler(err);
				if (!(er instanceof Error)) return msg.reply(er).catch(err =>
					msg.author.getDMChannel().then(ch =>
						ch.createMessage(`I couldn't send messages in the channel where that command was sent, so I've sent this here.\n${er}`)
							.catch(err => null)
					)
				);

				num = functions.random(10, "1234567890");
				code = `${msg.cmd.command.map(c => c.triggers[0]).join(".")}.${config.beta ? "beta" : "stable"}.${num}`;
				this.logger.error(`[CommandHandler] e1: ${err.name}: ${err.message}\n${err.stack},\nError Code: ${code}`);

				await mdb.collection("errors").insertOne({
					id: code,
					num,
					command: msg.cmd.command.join("."),
					error: {
						name: err.name,
						message: err.message,
						stack: err.stack
					},
					level: "e1",
					bot: {
						version: config.version,
						beta: config.beta,
						server: os.hostname()
					},
					author: {
						id: msg.author.id,
						tag: msg.author.tag
					},
					message: {
						id: msg.channel.id,
						content: msg.content,
						args: msg.args,
						unparsedArgs: msg.unparsedArgs
					},
					channel: {
						id: msg.channel.id,
						name: msg.channel.name
					},
					guild: {
						id: msg.channel.guild.id,
						name: msg.channel.guild.id,
						owner: {
							id: msg.channel.guild.ownerID,
							tag: this.users.has(msg.channel.guild.ownerID) ? `${this.users.get(msg.channel.guild.ownerID).username}#${this.users.get(msg.channel.guild.ownerID).discriminator}` : this.getRESTUser(msg.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
						}
					}
				});

				if (err.stack.length > 500) {
					const req = await phin({
						method: "POST",
						url: "https://pastebin.com/api/api_post.php",
						form: {
							api_dev_key: config.apis.pastebin.devKey,
							api_user_key: config.apis.pastebin.userKey,
							api_option: "paste",
							api_paste_code: err.stack,
							api_paste_private: "2",
							api_paste_name: "Furry Bot Stack Trace",
							api_paste_expire_date: "1W"
						}
					});

					stack = `Uploaded ${req.body.toString()}`;
				} else stack = err.stack;

				if (!config.developers.includes(msg.author.id)) {
					const owner = msg.channel.guild.members.get(msg.channel.guild.ownerID);
					embed = {
						title: "Level One Command Handler Error",
						description: `Error Code: \`${code}\``,
						author: {
							name: msg.channel.guild.name,
							icon_url: msg.channel.guild.iconURL
						},
						fields: [{
							name: "Server",
							value: `Server: ${msg.channel.guild.name} (${msg.channel.guild.id})\n\
	Server Creation Date: ${new Date(msg.channel.guild.createdAt).toString().split("GMT")[0]}\n\
	Owner: ${owner.username}#${owner.discriminator} (${owner.id})`,
							inline: false
						},
						{
							name: "Message",
							value: `Message Content: ${msg.content}\n\
	Message ID: ${msg.id}\n\
	Channel: ${msg.channel.name} (${msg.channel.id}, <#${msg.channel.id}>)\n\
	Author: ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
							inline: false
						},
						{
							name: "Command",
							value: `Command: ${msg.cmd.command.map(c => c.triggers[0]).join(" ")}\n\
	Arguments: ${msg.args.join(" ")}\n\
	Unparsed Args: ${msg.unparsedArgs.join(" ")}\n\
	Ran: ${msg.content}`,
							inline: false
						},
						{
							name: "Error",
							value: `Name: ${err.name}\n\
	Stack: ${stack}\n\
	Message: ${err.message}`,
							inline: false
						}
						]
					};
					await this.executeWebhook(config.webhooks.errors.id, config.webhooks.errors.token, {
						embeds: [embed],
						username: `Error Reporter${config.beta ? " - Beta" : ""}`
					});
					return msg.channel.createMessage(`An internal error occured while doing this, tell the people in my support server: <https://furry.bot/inv>.\nError code: \`${code}\``);
				} else {
					embed = {
						title: "Level One Command Handler Error",
						description: `Error Code: \`${code}\``,
						author: {
							name: msg.channel.guild.name,
							icon_url: msg.channel.guild.iconURL
						},
						fields: [{
							name: "Message",
							value: `Message Content: ${msg.content}\n\
	Message ID: ${msg.id}\n\
	Channel: ${msg.channel.name} (${msg.channel.id}, <#${msg.channel.id}>)\n\
	Author: ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
							inline: false
						},
						{
							name: "Command",
							value: `Command: ${msg.cmd.command.map(c => c.triggers[0]).join(" ")}\n\
	Arguments: ${msg.args.join(" ")}\n\
	Unparsed Args: ${msg.unparsedArgs.join(" ")}\n\
	Ran: ${msg.content}`,
							inline: false
						},
						{
							name: "Error",
							value: `Name: ${err.name}\n\
	Stack: ${stack}\n\
	Message: ${err.message}`,
							inline: false
						}
						]
					};
					return msg.channel.createMessage({
						content: `<@!${msg.author.id}> An error occured.`,
						embed
					}).catch(async (err) => {
						await msg.reply("Error while sending error embed, check console.").catch(err => null);

						console.error(err);
						console.debug(embed);
					});
				}
		}
	}
}));