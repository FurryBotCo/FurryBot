import ClientEvent from "../../../modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import ExtendedMessage from "../../../modules/extended/ExtendedMessage";
import Permissions from "../../../util/Permissions";
import functions, { ErrorHandler } from "../../../util/functions";
import { performance } from "perf_hooks";
import config from "../../../config/config";
import { mdb } from "../../../modules/Database";
import * as os from "os";
import phin from "phin";
import * as fs from "fs-extra";

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
					console.error(`Failed to get blacklist notice viewed list`);
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
				const c = await this.getRESTGuild(config.bot.mainGuild);
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

				await this.executeWebhook(config.webhooks.directMessage.id, config.webhooks.directMessage.token, {
					embeds: [embed],
					username: `Direct Messages${config.beta ? " - Beta" : ""}`,
					avatarURL: "https://i.furry.bot/furry.png"
				});

				await msg.author.getDMChannel().then(dm => dm.createMessage("Hey, I see that you're sending dm advertisments to me, that isn't a good idea.. You've been auto banned from my support server for dm advertising."));
				return this.logger.log(`DM Advertisment recieved from ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`, msg.guild.shard.id);
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

				await this.executeWebhook(config.webhooks.directMessage.id, config.webhooks.directMessage.token, {
					embeds: [embed],
					username: `Direct Messages${config.beta ? " - Beta" : ""}`,
					avatarURL: "https://i.furry.bot/furry.png"
				});

				await msg.author.getDMChannel().then(dm => dm.createMessage(`Hey, I see you messaged me! Here's some quick tips:\n\nYou can go to <https://furry.bot> to see our website, use \`${config.defaultPrefix}help\` to see my commands, and join <https://furry.bot/inv> if you need more help!\nCommands __**CAN NOT**__ be ran in my dms!\nThese dms are not a good source to ask for support, do that in our support server <https://discord.gg/YazeA7e>!\nIf you spam my dms, you will get blacklisted!`));
				return this.logger.log(`Direct message recieved from ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`, msg.guild.shard.id);
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
	If you need some help with me, you can visit my support server [here](https://discord.gg/YazeA7e)`
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

		if (msg.response !== null && msg.channel.permissionsOf(this.user.id).has("sendMessages")) {
			/* blacklist notice */
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
			/* end blacklist notice */

			if (!config.developers.includes(msg.author.id) && !msg.uConfig.blacklist.blacklisted && ((msg.response.triggers[0] === "f" && msg.gConfig.fResponseEnabled)) || msg.content.toLowerCase() !== "f") {
				this.responseSpamCounter.push({
					time: Date.now(),
					user: msg.author.id,
					response: msg.response.triggers[0]
				});

				const sp = [...this.responseSpamCounter.filter(s => s.user === msg.author.id)];
				let spC = sp.length;
				if (sp.length >= config.antiSpam.response.start && sp.length % config.antiSpam.response.warning === 0) {
					/*if (sp.length % 10 === 0) p = await phin({
						method: "POST",
						url: "https://pastebin.com/api/api_post.php",
						form: {
							api_dev_key: config.apis.pastebin.devKey,
							api_user_key: config.apis.pastebin.userKey,
							api_option: "paste",
							api_paste_code: report,
							api_paste_private: "1",
							api_paste_name: `Furry Bot Spam Report${config.beta ? " - Beta" : ""}`,
							api_paste_expire_date: "1D"
						}
					}).then(res => res.body.toString());
					else p = "None Generated.";*/

					let report: any = {
						userTag: msg.author.tag,
						userId: msg.author.id,
						generatedTimestamp: Date.now(),
						entries: sp.map(s => ({ response: s.response, time: s.time })),
						type: "response",
						beta: config.beta
					};

					const d = fs.readdirSync(`${config.logsDir}/spam`).filter(d => !fs.lstatSync(`${config.logsDir}/spam/${d}`).isDirectory() && d.startsWith(msg.author.id) && d.endsWith("-response.json") && fs.lstatSync(`${config.logsDir}/spam/${d}`).birthtimeMs + 3e5 > Date.now());

					if (d.length > 0) {
						report = functions.combineReports(...d.map(f => JSON.parse(fs.readFileSync(`${config.logsDir}/spam/${f}`).toString())), report);
						spC = report.entries.length;
						d.map(f => fs.unlinkSync(`${config.logsDir}/spam/${f}`));
					}

					const reportId = functions.random(10);

					fs.writeFileSync(`${config.logsDir}/spam/${msg.author.id}-${reportId}-response.json`, JSON.stringify(report));

					await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
						embeds: [
							{
								title: `Possible Auto Response Spam From ${msg.author.tag} (${msg.author.id}) | VL: ${spC}`,
								description: `Report: ${config.beta ? `http://localhost:12346/reports/response/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/response/${msg.author.id}/${reportId}`}`
							}
						],
						username: `FurryBot Spam Logs${config.beta ? " - Beta" : ""}`,
						avatarURL: "https://assets.furry.bot/blacklist_logs.png"
					});

					if (spC >= config.antiSpam.response.blacklist) {
						await msg.uConfig.edit({
							blacklist: {
								blacklisted: true,
								reason: `Spamming Auto Responses. Automatic Blacklist for a VL at or above ${config.antiSpam.response.blacklist}`,
								blame: "Automatic"
							}
						});

						await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
							embeds: [
								{
									title: "User Blacklisted",
									description: `Id: ${msg.author.id}\nTag: ${msg.author.tag}\nReason: Spamming Auto Responses. Automatic Blacklist for a VL at or above ${config.antiSpam.response.blacklist}\nBlame: Automatic`,
									timestamp: new Date().toISOString(),
									color: functions.randomColor()
								}
							],
							username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
							avatarURL: "https://assets.furry.bot/blacklist_logs.png"
						});
					}

					return msg.reply(`It seems like you may be spamming commands, try to slow down a bit.. VL: ${spC}`);
				}
			}

			if (msg.response.userPermissions.length > 0 && !config.developers.includes(msg.author.id)) {
				if (msg.response.userPermissions.some(perm => !msg.channel.permissionsOf(msg.author.id).has(perm))) {
					const p = msg.response.userPermissions.filter(perm => !msg.channel.permissionsOf(msg.author.id).has(perm));

					embed = {
						title: "You do not have the required permission(s) to use this!",
						description: `You require the permission(s) **${p.join("**, **")}** to run this, which you do not have.`,
						color: functions.randomColor(),
						timestamp: new Date().toISOString()
					};
					this.logger.debug(`user ${msg.author.tag} (${msg.author.id}) is missing the permission(s) ${p.join(", ")} to run the response ${msg.response.triggers[0]}`, msg.guild.shard.id);
					return msg.channel.createMessage({ embed });
				}
			}

			if (msg.response.botPermissions.length > 0 && !config.developers.includes(msg.author.id)) {
				if (msg.response.userPermissions.some(perm => !msg.channel.permissionsOf(this.user.id).has(perm))) {
					const p = msg.response.botPermissions.filter(perm => !msg.channel.permissionsOf(this.user.id).has(perm));

					embed = {
						title: "I do not have the required permission(s) to use this!",
						description: `I need the permission(s) **${p.join("**, **")}** for this command to function properly, please add these to me and try again.`,
						color: functions.randomColor(),
						timestamp: new Date().toISOString()
					};
					this.logger.debug(`I am missing the permission(s) ${p.join(", ")} for the response ${msg.response.triggers[0]}, server: ${msg.channel.guild.name} (${msg.channel.guild.id})`, msg.guild.shard.id);
					return msg.channel.createMessage({ embed });
				}
			}

			if (this.commandTimeout[msg.response.triggers[0]].has(msg.author.id) && !config.developers.includes(msg.author.id)) {
				this.logger.log(`Response timeout encountered by user ${msg.author.tag} (${msg.author.id}) on response "${msg.response.triggers[0]}" in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, msg.guild.shard.id);

				return msg.channel.createMessage(`<@!${msg.author.id}>, <:cooldown:591863995057831946>\nPlease wait ${functions.ms(msg.response.cooldown)} before using this response again!`);
			}

			this.logger.command(`Response  "${msg.response.triggers[0]}" ran with arguments "${msg.unparsedArgs.join(" ")}" by user ${msg.author.tag} (${msg.author.id}) in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, msg.guild.shard.id);
			const start = performance.now();
			const c = await msg.response.run.call(this, msg);
			const end = performance.now();
			this.logger.debug(`Response handler for "${msg.response.triggers[0]}" took ${(end - start).toFixed(3)}ms to execute.`, msg.guild.shard.id);
			if (c instanceof Error) throw c;
			return;
		}

		if (!msg.content.toLowerCase().startsWith(msg.prefix.toLowerCase())) return;

		if (msg.cmd !== null && msg.cmd.command !== null && msg.cmd.command.length > 0) {
			/* blacklist notice */
			if (bl) {
				let t;
				let v: string[];
				try {
					if (!fs.existsSync(`${__dirname}/../../../config/blNoticeViewed.json`)) fs.writeFileSync(`${__dirname}/../../../config/blNoticeViewed.json`, JSON.stringify([]));
					v = JSON.parse(fs.readFileSync(`${__dirname}/../../../config/blNoticeViewed.json`).toString());
				} catch (e) {
					console.error(`Failed to get blacklist notice viewed list`, msg.guild.shard.id);
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

			/* end blacklist notice */

			const [cmd] = msg.cmd.command;

			// if (!msg.channel.permissionsOf(this.user.id).has("readMessages")) return msg.author.getDMChannel().then(dm => dm.createMessage("I am missing the `readMessages` permission to run the command you tried to run.").catch(err => null));
			// if (!msg.channel.permissionsOf(this.user.id).has("sendMessages")) return msg.author.getDMChannel().then(dm => dm.createMessage("I am missing the `sendMessages` permission to run the command you tried to run.").catch(err => null));

			// if (msg.cmd.category.name === "custom" && msg.channel.guild.id !== config.bot.mainGuild) return msg.reply("This command cannot be ran in this server!");

			if (!config.developers.includes(msg.author.id) && !msg.uConfig.blacklist.blacklisted) {
				this.spamCounter.push({
					time: Date.now(),
					user: msg.author.id,
					cmd: msg.cmd.command[0].triggers[0]
				});

				const sp = [...this.spamCounter.filter(s => s.user === msg.author.id)];
				let spC = sp.length;
				if (sp.length >= config.antiSpam.cmd.start && sp.length % config.antiSpam.cmd.warning === 0) {
					/*if (sp.length % 10 === 0) p = await phin({
						method: "POST",
						url: "https://pastebin.com/api/api_post.php",
						form: {
							api_dev_key: config.apis.pastebin.devKey,
							api_user_key: config.apis.pastebin.userKey,
							api_option: "paste",
							api_paste_code: report,
							api_paste_private: "1",
							api_paste_name: `Furry Bot Spam Report${config.beta ? " - Beta" : ""}`,
							api_paste_expire_date: "1D"
						}
					}).then(res => res.body.toString());
					else p = "None Generated.";*/

					let report: any = {
						userTag: msg.author.tag,
						userId: msg.author.id,
						generatedTimestamp: Date.now(),
						entries: sp.map(s => ({ cmd: s.cmd, time: s.time })),
						type: "cmd",
						beta: config.beta
					};

					const d = fs.readdirSync(`${config.logsDir}/spam`).filter(d => !fs.lstatSync(`${config.logsDir}/spam/${d}`).isDirectory() && d.startsWith(msg.author.id) && d.endsWith("-cmd.json") && fs.lstatSync(`${config.logsDir}/spam/${d}`).birthtimeMs + 3e5 > Date.now());

					if (d.length > 0) {
						report = functions.combineReports(...d.map(f => JSON.parse(fs.readFileSync(`${config.logsDir}/spam/${f}`).toString())), report);
						spC = report.entries.length;
						d.map(f => fs.unlinkSync(`${config.logsDir}/spam/${f}`));
					}

					const reportId = functions.random(10);

					fs.writeFileSync(`${config.logsDir}/spam/${msg.author.id}-${reportId}-cmd.json`, JSON.stringify(report));

					await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
						embeds: [
							{
								title: `Possible Command Spam From ${msg.author.tag} (${msg.author.id}) | VL: ${spC}`,
								description: `Report: ${config.beta ? `http://localhost:12346/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`
							}
						],
						username: `FurryBot Spam Logs${config.beta ? " - Beta" : ""}`,
						avatarURL: "https://assets.furry.bot/blacklist_logs.png"
					});

					if (spC >= config.antiSpam.cmd.blacklist) {
						await msg.uConfig.edit({
							blacklist: {
								blacklisted: true,
								reason: `Spamming Commands. Automatic Blacklist for a VL at or above ${config.antiSpam.cmd.blacklist}`,
								blame: "Automatic"
							}
						});

						await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
							embeds: [
								{
									title: "User Blacklisted",
									description: `Id: ${msg.author.id}\nTag: ${msg.author.tag}\nReason: Spamming Commands. Automatic Blacklist for a VL at or above ${config.antiSpam.cmd.blacklist}\nBlame: Automatic`,
									timestamp: new Date().toISOString(),
									color: functions.randomColor()
								}
							],
							username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
							avatarURL: "https://assets.furry.bot/blacklist_logs.png"
						});
					}

					return msg.reply(`It seems like you may be spamming commands, try to slow down a bit.. VL: ${spC}`);
				}
			}

			if (cmd.devOnly && !config.developers.includes(msg.author.id)) return msg.reply(`This command (**${cmd.triggers[0]}**) has been set to developer only, and you are not a developer of this bot, therefore you can not run this command.`);

			if (cmd.guildOwnerOnly && (msg.author.id !== msg.guild.ownerID) && !config.developers.includes(msg.author.id)) return msg.reply("This command can only be ran by the owner of this server.");

			if (cmd.nsfw) {
				if (!msg.channel.nsfw) return msg.reply("This command can only be ran in nsfw channels.", {
					file: await functions.getImageFromURL("https://assets.furry.bot/nsfw.gif"),
					name: "nsfw.gif"
				});
				if (!msg.gConfig.nsfwEnabled) return msg.reply(`You must enable nsfw commands to use this, have a server administrator run \`${msg.gConfig.prefix}settings nsfw enabled\``);

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

			/*if (cmd.userPermissions.length > 0 && !config.developers.includes(msg.author.id)) {
				if (cmd.userPermissions.some(perm => !msg.channel.permissionsOf(msg.author.id).has(perm))) {
					const p = cmd.userPermissions.filter(perm => !msg.channel.permissionsOf(msg.author.id).has(perm));

					embed = {
						title: "You do not have the required permission(s) to use this!",
						description: `You require the permission(s) **${p.join("**, **")}** to run this, which you do not have.`,
						color: functions.randomColor(),
						timestamp: new Date().toISOString()
					};
					this.logger.debug(`user ${msg.author.tag} (${msg.author.id}) is missing the permission(s) ${p.join(", ")} to run the command ${cmd.triggers[0]}`, msg.guild.shard.id);
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
					this.logger.debug(`I am missing the permission(s) ${p.join(", ")} for the command ${cmd.triggers[0]}, server: ${msg.channel.guild.name} (${msg.channel.guild.id})`, msg.guild.shard.id);
					return msg.channel.createMessage({ embed });
				}
			}*/

			if (this.commandTimeout[cmd.triggers[0]].has(msg.author.id) && !config.developers.includes(msg.author.id)) {
				this.logger.log(`Command timeout encountered by user ${msg.author.tag} (${msg.author.id}) on command "${cmd.triggers[0]}" in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, msg.guild.shard.id);

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
			this.logger.command(`Command  "${cmd.triggers[0]}" ran with arguments "${msg.unparsedArgs.join(" ")}" by user ${msg.author.tag} (${msg.author.id}) in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, msg.guild.shard.id);

			if (msg.uConfig.tips && cmd.category.name === "economy") {
				const chance = Math.floor((Math.random() * 4) + 1);
				if (chance === 1) {
					const tip = config.eco.tips[Math.floor(Math.random() * config.eco.tips.length)];
					await msg.channel.createMessage(`${tip}\n\nYou can turn these off by using \`${msg.gConfig.prefix}toggletips\``);
				}
			}

			const start = performance.now();
			const c = await cmd.run.call(this, msg);
			const end = performance.now();
			this.logger.debug(`Command handler for "${cmd.triggers[0]}" took ${(end - start).toFixed(3)}ms to execute.`, msg.guild.shard.id);
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
				this.logger.error(`[CommandHandler] e1: ${err.name}: ${err.message}\n${err.stack},\nError Code: ${code}`, msg.guild.shard.id);

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