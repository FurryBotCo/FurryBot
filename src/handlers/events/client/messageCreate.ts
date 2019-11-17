import { ClientEvent, Permissions, ExtendedMessage } from "bot-stuff";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import GuildConfig from "../../../modules/config/GuildConfig";
import UserConfig from "../../../modules/config/UserConfig";
import config from "../../../config";
import { mdb } from "../../../modules/Database";
import * as os from "os";
import phin from "phin";
import * as fs from "fs-extra";
import CmdHandler from "../../../util/cmd";

export default new ClientEvent<FurryBot>("messageCreate", (async function (this: FurryBot, message: Eris.Message) {
	/* dev only */
	await this.a.track("message", {
		messageId: message.id,
		userId: message.author.id,
		channelid: message.channel.id,
		guildId: (message.channel as Eris.TextChannel).guild ? (message.channel as Eris.TextChannel).guild.id : null,
		mentionEveryone: message.mentionEveryone,
		mentions: message.mentions.map(m => m.id),
		roleMentions: message.roleMentions,
		channelMentions: message.channelMentions,
		messageTimestamp: message.timestamp,
		tts: message.tts,
		type: message.type,
		clusterId: this.cluster.id,
		shardId: (message.channel as Eris.TextChannel).guild ? (message.channel as Eris.TextChannel).guild.shard.id : null,
		timestamp: Date.now()
	});
	if (!message || (config.beta && !config.developers.includes(message.author.id))) return;

	const msg = new ExtendedMessage<FurryBot, UserConfig, GuildConfig>(message, this, mdb, UserConfig, GuildConfig);
	await msg._load.call(msg, config, Logger);


	if (msg.author.bot || msg.uConfig.dmActive) return;

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

	if (msg.channel.type !== 1 && !bl && (typeof msg.gConfig.blacklist !== "undefined" && msg.gConfig.blacklist.blacklisted) && !config.developers.includes(msg.author.id)) {
		bl = true;
		blReason = {
			type: 1,
			reason: msg.gConfig.blacklist.reason,
			blame: msg.gConfig.blacklist.blame
		};
	}

	try {

		if (msg.channel.type === 1) {

			if (bl) {
				let t;
				let v: string[];
				try {
					if (!fs.existsSync(`${__dirname}/../../../config/blNoticeViewed.json`)) fs.writeFileSync(`${__dirname}/../../../config/blNoticeViewed.json`, JSON.stringify([]));
					v = JSON.parse(fs.readFileSync(`${__dirname}/../../../config/blNoticeViewed.json`).toString());
				} catch (e) {
					Logger.error(`Cluster #${this.clusterId}`, `Failed to get blacklist notice viewed list`);
					v = null;
				}

				if (v === null || v.includes(msg.author.id)) return;
				else {
					v.push(msg.author.id);
					fs.writeFileSync(`${__dirname}/../../../config/blNoticeViewed.json`, JSON.stringify(v));
				}

				if (blReason.type === 0) t = `You are blacklisted from using this bot, reason: ${blReason.reason}, blame: ${blReason.blame}`;
				// else t = `This server is blacklisted from using this bot, reason: ${blReason.reason}, blame: ${blReason.blame}`;

				return msg.channel.createMessage(t);

			}
			/* end blacklist notice */

			let dmAds;
			// dm advertising to bot
			if (/discord\.gg/gi.test(msg.content.toLowerCase())) {
				dmAds = true;
				const c = await this.bot.getRESTGuild(config.bot.mainGuild);
				await c.banMember(msg.author.id, 0, "Advertising in bots dms.");

				embed = {
					title: `DM Advertisment from ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
					description: "User auto banned.",
					fields: [{
						name: "Content",
						value: msg.content,
						inline: false
					}]
				};

				await this.bot.executeWebhook(config.webhooks.directMessage.id, config.webhooks.directMessage.token, {
					embeds: [embed],
					username: `Direct Messages${config.beta ? " - Beta" : ""}`,
					avatarURL: "https://i.furry.bot/furry.png"
				});

				await msg.author.getDMChannel().then(dm => dm.createMessage("Hey, I see that you're sending dm advertisments to me, that isn't a good idea.. You've been auto banned from my support server for dm advertising."));
				return Logger.log(`DM Advertisment recieved from ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`, msg.guild.shard.id);
			} else {
				dmAds = false;
				embed = {
					title: `Direct Message from ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
					fields: [{
						name: "Content",
						value: msg.content,
						inline: false
					}]
				};

				await this.bot.executeWebhook(config.webhooks.directMessage.id, config.webhooks.directMessage.token, {
					embeds: [embed],
					username: `Direct Messages${config.beta ? " - Beta" : ""}`,
					avatarURL: "https://i.furry.bot/furry.png"
				});

				await msg.author.getDMChannel().then(dm => dm.createMessage(`Hey, I see you messaged me! Here's some quick tips:\n\nYou can go to <https://furry.bot> to see our website, use \`${config.defaultPrefix}help\` to see my commands, and join <https://furry.bot/inv> if you need more help!\nCommands __**CAN NOT**__ be ran in my dms!\nThese dms are not a good source to ask for support, do that in our support server <https://discord.gg/YazeA7e>!\nIf you spam my dms, you will get blacklisted!`));
				return Logger.log(`Cluster #${this.cluster.id}`, `Direct message recieved from ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`);
			}


			if (dmAds) return;
		}

		if ([`<@!${this.bot.user.id}>`, `<@${this.bot.user.id}>`].includes(msg.content) && !bl) {
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
				color: this.f.randomColor(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				timestamp: new Date().toISOString(),
				description: `\
	Hi, ${msg.author.tag}! Since you've mentioned me, here's a little about me:\n\
	My prefix here is ${msg.gConfig.settings.prefix}, you can see my commands by using \`${msg.gConfig.settings.prefix}help\`, you can change my prefix by using \`${msg.gConfig.settings.prefix}prefix <new prefix>\`\n\
	If you want to invite me to another server, you can use [this link](https://discordapp.com/oauth2/authorize?client_id=${this.bot.user.id}&scope=bot&permissions=${botPerms}), or, if that isn't working, you can visit [https://furry.bot/add](https://furry.bot/add)\n\
	If you need some help with me, you can visit my support server [here](https://discord.gg/YazeA7e)`
			};
			if (!msg.channel.permissionsOf(this.bot.user.id).has("sendMessages")) {
				return msg.author.getDMChannel().then(dm => dm.createMessage({
					content: "I couldn't send messages in the channel where I was mentioned, so I sent this directly to you!",
					embed
				})).catch(error => null);
			} else if (!msg.channel.permissionsOf(this.bot.user.id).has("embedLinks")) {
				return msg.channel.createMessage(`${embed.title}\n${embed.description}\n(If you give me permission to embed links this would look a lot nicer)`);
			} else {
				return msg.channel.createMessage({
					embed
				});
			}
		}

		if (["f", "rip"].includes(msg.content.toLowerCase()) && msg.gConfig.settings.fResponse) {

			if (!config.developers.includes(msg.author.id) && !msg.uConfig.blacklist.blacklisted) {
				this.responseSpamCounter.push({
					time: Date.now(),
					user: msg.author.id,
					response: "f"
				});

				const sp = [...this.responseSpamCounter.filter(s => s.user === msg.author.id)];
				let spC = sp.length;
				if (sp.length >= config.antiSpam.response.start && sp.length % config.antiSpam.response.warning === 0) {

					let report: any = {
						userTag: msg.author.tag,
						userId: msg.author.id,
						generatedTimestamp: Date.now(),
						entries: sp.map(s => ({ response: s.response, time: s.time })),
						type: "response",
						beta: config.beta
					};

					const d = fs.readdirSync(`${config.logsDir}/spam`).filter(d => !fs.lstatSync(`${config.logsDir}/spam/${d}`).isDirectory() && d.startsWith(msg.author.id) && d.endsWith("-response.json") && fs.lstatSync(`${config.logsDir}/spam/${d}`).birthtimeMs + 1.2e5 > Date.now());

					if (d.length > 0) {
						report = this.f.combineReports(...d.map(f => JSON.parse(fs.readFileSync(`${config.logsDir}/spam/${f}`).toString())), report);
						spC = report.entries.length;
						d.map(f => fs.unlinkSync(`${config.logsDir}/spam/${f}`));
					}

					const reportId = this.f.random(10);

					fs.writeFileSync(`${config.logsDir}/spam/${msg.author.id}-${reportId}-response.json`, JSON.stringify(report));

					await this.bot.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
						embeds: [
							{
								title: `Possible Auto Response Spam From ${msg.author.tag} (${msg.author.id}) | VL: ${spC}`,
								description: `Report: ${config.beta ? `https://${config.apiBindIp}:${config.apiPort}/reports/response/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/response/${msg.author.id}/${reportId}`}`
							}
						],
						username: `FurryBot Spam Logs${config.beta ? " - Beta" : ""}`,
						avatarURL: "https://assets.furry.bot/blacklist_logs.png"
					});

					if (spC >= config.antiSpam.response.blacklist) {
						await msg.uConfig.edit({
							blacklist: {
								blacklisted: true,
								reason: `Spamming Auto Responses. Automatic Blacklist.`,
								blame: "Automatic"
							}
						});

						await this.bot.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
							embeds: [
								{
									title: "User Blacklisted",
									description: `Id: ${msg.author.id}\nTag: ${msg.author.tag}\nReason: Spamming Auto Responses. Automatic Blacklist.\nBlame: Automatic`,
									timestamp: new Date().toISOString(),
									color: this.f.randomColor()
								}
							],
							username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
							avatarURL: "https://assets.furry.bot/blacklist_logs.png"
						});
					}

					return; // msg.reply(`It seems like you may be spamming commands, try to slow down a bit.. VL: ${spC}`);
				}
			}

			let count = await mdb.collection("stats").findOne({ id: "fCount" }).then(res => parseInt(res.count, 10)).catch(err => 1);
			await mdb.collection("stats").findOneAndUpdate({ id: "fCount" }, { $set: { count: ++count } });
			return msg.channel.createMessage(`<@!${msg.author.id}> has paid respects,\n\nRespects paid total: **${count}**\n\nYou can turn this auto response off by using \`${msg.gConfig.settings.prefix}settings fResponse disabled\``);
		}

		if (!msg.prefix || !msg.content.toLowerCase().startsWith(msg.prefix.toLowerCase()) || msg.content.toLowerCase() === msg.prefix.toLowerCase()) return;

		const h = await CmdHandler.handleCommand(msg).catch(err => err);
		if (h instanceof Error) throw h;

	} catch (e) {
		const err: Error = e; // typescript doesn't allow annotating of catch clause variables, ts-1196
		let embed: Eris.EmbedOptions, num: string, code: string, stack: string;

		let cmd;
		if (msg.cmd) cmd = CmdHandler.getCommand(msg.cmd[msg.cmd.length - 1]);
		else throw e;

		switch (err.message.toUpperCase()) {
			case "ERR_INVALID_USAGE":
				embed = {
					title: ":x: Invalid Command Usage",
					color: 15601937,
					fields: [{
						name: "Command",
						value: msg.cmd.join(" > "),
						inline: false
					}, {
						name: "Usage",
						value: `${msg.gConfig.settings.prefix}${msg.cmd.join(" ")} ${cmd.usage}`,
						inline: false
					}, {
						name: "Description",
						value: cmd.description,
						inline: false
					}, {
						name: "Category",
						value: typeof cmd.category !== "undefined" && typeof cmd.category.name !== "undefined" ? this.f.ucwords(cmd.category.name) : "Unknown",
						inline: false
					}, {
						name: "Arguments Provided",
						value: msg.args.length !== 0 ? msg.args.join(" ") : "NONE",
						inline: false
					}
					]
				};
				return msg.channel.createMessage({
					embed
				})
					.catch(async (err) =>
						msg.author.getDMChannel()
							.then(dm =>
								dm.createMessage("I couldn't send messages in the channel you ran that in, please contact a server administrator.")
							)
					).catch(err => null);

				break; // eslint-disable-line no-unreachable

			case "HELP":
				// this.f.sendCommandEmbed(msg, msg.cmd.command);
				return Logger.log(`Cluster #${this.clusterId}`, "help");
				break; // eslint-disable-line no-unreachable

			default:
				// internal error handling
				const er = this.f.ErrorHandler(err);
				Logger.error(`Cluster #${this.clusterId}`, err);
				if (!(er instanceof Error)) return msg.reply(er).catch(err =>
					msg.author.getDMChannel().then(ch =>
						ch.createMessage(`I couldn't send messages in the channel where that command was sent, so I've sent this here.\n${er}`)
							.catch(err => null)
					)
				);

				num = this.f.random(10, "1234567890");
				code = `${msg.cmd.join(".")}.${config.beta ? "beta" : "stable"}.${num}`;
				Logger.error(`[CommandHandler] e1: ${err.name}: ${err.message}\n${err.stack},\nError Code: ${code}`, msg.guild.shard.id);

				await mdb.collection("errors").insertOne({
					id: code,
					num,
					command: msg.cmd.join("."),
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
							tag: this.bot.users.has(msg.channel.guild.ownerID) ? `${this.bot.users.get(msg.channel.guild.ownerID).username}#${this.bot.users.get(msg.channel.guild.ownerID).discriminator}` : this.bot.getRESTUser(msg.channel.guild.ownerID).then(res => `${res.username}#${res.discriminator}`)
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
							api_paste_expire_date: "1D"
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
							value: `Server: ${msg.channel.guild.name} (${msg.channel.guild.id})\nServer Creation Date: ${new Date(msg.channel.guild.createdAt).toString().split("GMT")[0]}\nOwner: ${owner.username}#${owner.discriminator} (${owner.id})`,
							inline: false
						},
						{
							name: "Message",
							value: `Message Content: ${msg.content}\nMessage ID: ${msg.id}\nChannel: ${msg.channel.name} (${msg.channel.id}, <#${msg.channel.id}>)\nAuthor: ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
							inline: false
						},
						{
							name: "Command",
							value: `Command: ${msg.cmd.join(" > ")}\nArguments: ${msg.args.join(" ")}\nUnparsed Args: ${msg.unparsedArgs.join(" ")}\nRan: ${msg.content}`,
							inline: false
						},
						{
							name: "Error",
							value: `Name: ${err.name}\nStack: ${stack}\nMessage: ${err.message}`,
							inline: false
						}
						]
					};
					await this.bot.executeWebhook(config.webhooks.errors.id, config.webhooks.errors.token, {
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
							value: `Message Content: ${msg.content}\nMessage ID: ${msg.id}\nChannel: ${msg.channel.name} (${msg.channel.id}, <#${msg.channel.id}>)\nAuthor: ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
							inline: false
						},
						{
							name: "Command",
							value: `Command: ${msg.cmd.join(" > ")}\nArguments: ${msg.args.join(" ")}\nUnparsed Args: ${msg.unparsedArgs.join(" ")}\nRan: ${msg.content}`,
							inline: false
						},
						{
							name: "Error",
							value: `Name: ${err.name}\nStack: ${stack}\nMessage: ${err.message}`,
							inline: false
						}
						]
					};

					return msg.channel.createMessage({
						content: `<@!${msg.author.id}> An error occured.`,
						embed
					}).catch(async (err) => {
						await msg.reply("Error while sending error embed, check console.").catch(err => null);

						Logger.error(`Cluster #${this.clusterId}`, err);
						Logger.debug(`Cluster #${this.clusterId}`, embed);
					});
				}
		}
	}
}));
