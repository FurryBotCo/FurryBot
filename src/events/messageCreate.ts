import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import Eris from "eris";
import ExtendedMessage from "../modules/ExtendedMessage";
import Timers from "../util/Timers";
import config from "../config";
import db, { mdb } from "../modules/Database";
import { Time, Internal, Strings, Request } from "../util/Functions";
import { Blacklist } from "../util/@types/Misc";
import EmbedBuilder from "../util/EmbedBuilder";
import * as fs from "fs-extra";
import { Colors } from "../util/Constants";
import * as uuid from "uuid";
import GuildConfig from "../modules/config/GuildConfig";
import UserConfig from "../modules/config/UserConfig";
import phin from "phin";
import Language from "../util/Language";
import rClient from "../util/Redis";

export default new ClientEvent("messageCreate", (async function (this: FurryBot, message: Eris.Message<Eris.GuildTextableChannel>) {
	await this.track("events", "messageCreate");
	await this.track("stats", "messages");
	let
		msg: ExtendedMessage<Eris.GuildTextableChannel>,
		gConfig: GuildConfig,
		uConfig: UserConfig;
	try {
		const t = new Timers(this, config.beta || config.developers.includes(message.author.id));
		t.start("main");

		if (!message || !message.author || message.author.bot || (config.beta && !config.contributors.includes(message.author.id)) || !this.firstReady) return;

		t.start("messageProcess");
		msg = new ExtendedMessage(message, this);
		t.end("messageProcess");

		t.start("blacklist");
		const gblB: Blacklist.GuildEntry[] = [Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(msg.channel.type) ? await mdb.collection("blacklist").find({ guildId: msg.channel.guild.id }).toArray().then(res => res.filter(r => [0, null].includes(r.expire) || r.expire > Date.now())) : [];
		const gbl: Blacklist.GuildEntry[] = gblB.filter(r => [0, null].includes(r.expire) || r.expire > Date.now());
		const ublB: Blacklist.UserEntry[] = await mdb.collection("blacklist").find({ userId: msg.author.id }).toArray();
		const ubl: Blacklist.UserEntry[] = ublB.filter(r => [0, null].includes(r.expire) || r.expire > Date.now());
		const bl = gbl.length > 0 || ubl.length > 0;

		if (!config.beta && msg.member && msg.member.roles.includes(config.blacklistRoleId) && !bl) await msg.member.removeRole(config.blacklistRoleId, "user is not blacklisted (might have expired)").catch(err => null);

		if (!config.beta && bl && !config.developers.includes(msg.author.id)) {
			if (msg.channel.guild && msg.channel.guild.id === config.bot.mainGuild) {
				if (!msg.member.roles.includes(config.blacklistRoleId)) await msg.member.addRole(config.blacklistRoleId, "user is blacklisted").catch(err => null);
			}

			if (msg.cmd && msg.cmd.cmd) {
				if (ubl.length > 0) {
					const n = ubl.filter(u => !u.noticeShown);
					if (n.length > 0) {

						await mdb.collection("blacklist").findOneAndUpdate({ id: n[0].id }, { $set: { noticeShown: true } });
						const expiry = [0, null].includes(n[0].expire) ? "Never" : Time.formatDateWithPadding(new Date(n[0].expire));
						return msg.reply(`you were blacklisted on ${Time.formatDateWithPadding(n[0].created)}.Reason: ${n[0].reason}, blame: ${n[0].blame}.Expiry: ${expiry}.You can ask about your blacklist in our support server: <${config.bot.supportURL} > `).catch(err => null);
					} else return;
				}

				if ([Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(msg.channel.type) && gbl.length > 0) {
					const n = ubl.filter(u => !u.noticeShown);
					if (n.length > 0) {
						await mdb.collection("blacklist").findOneAndUpdate({ id: n[0].id }, { $set: { noticeShown: true } });
						const expiry = [0, null].includes(n[0].expire) ? "Never" : Time.formatDateWithPadding(new Date(n[0].expire));
						return msg.reply(`this server was blacklisted on ${Time.formatDateWithPadding(n[0].created)}.Reason: ${n[0].reason}.Blame: ${n[0].blame}.Expiry: ${expiry}.You can ask about your blacklist in our support server: <${config.bot.supportURL} > `).catch(err => null);
					} else return;
				}
			}

			return;
		}
		t.end("blacklist");
		t.start("dm");
		// needed due to everything else being GuildTextableChannel
		if ((message.channel as unknown as Eris.PrivateChannel).type === Eris.Constants.ChannelTypes.DM) {
			this.track("stats", "directMessage");
			if (bl) return;

			if (/discord\.gg/gi.test(msg.content.toLowerCase())) {
				this.track("stats", "directMessageInvite");
				// being more constructive instead of outright banning
				// const g = await this.getRESTGuild(config.bot.mainGuild);
				// await g.banMember(message.author.id, 0, "Advertising in bots dms.");

				await this.executeWebhook(config.webhooks.directMessage.id, config.webhooks.directMessage.token, {
					embeds: [{
						title: `DM Invite from ${msg.author.username}#${msg.author.discriminator}(${msg.author.id})`,
						fields: [{
							name: "Content",
							value: msg.content,
							inline: false
						}],
						timestamp: new Date().toISOString()
					}],
					username: `Direct Messages${config.beta ? " - Beta" : ""}`,
					avatarURL: "https://i.furry.bot/furry.png"
				});

				await msg.author.getDMChannel().then(dm => dm.createMessage(config.bot.directMessage.invite)).catch(err => null);
				return this.log("log", `DM Advertisment recieved from ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`, "Direct Message");
			} else {
				await this.w.get("directMessage").execute({
					embeds: [{
						title: `Direct Message from ${msg.author.username}#${msg.author.discriminator}(${msg.author.id})`,
						fields: [{
							name: "Content",
							value: msg.content,
							inline: false
						}],
						timestamp: new Date().toISOString()
					}],
					username: `Direct Messages${config.beta ? " - Beta" : ""}`,
					avatarURL: "https://i.furry.bot/furry.png"
				});

				await msg.author.getDMChannel().then(dm => dm.createMessage(config.bot.directMessage.normal));
				return this.log("log", `Direct message recieved from ${msg.author.username}#${msg.author.discriminator}: ${msg.content}`, "Direct Message");
			}
		}
		t.end("dm");
		t.start("db");
		uConfig = await db.getUser(msg.author.id);
		gConfig = await db.getGuild(msg.channel.guild.id);

		// overwrite prefix set without db
		if (gConfig.settings.prefix !== config.defaults.prefix) msg.prefix = gConfig.settings.prefix;
		t.end("db");



		t.start("leveling");
		if ([Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_TEXT].includes(msg.channel.type)) {
			const c = this.cd.check(msg.author.id, "leveling", { guild: msg.channel.guild.id });
			if (!c.found) {
				this.cd.add(msg.author.id, "leveling", 6e4, { guild: msg.channel.guild.id });
				const lvl = config.leveling.calcLevel(uConfig.getLevel(msg.channel.guild.id));
				const l = Math.floor(Math.random() * 10) + 5;
				await uConfig.edit({
					levels: {
						[msg.channel.guild.id]: uConfig.getLevel(msg.channel.guild.id) + l
					}
				});
				await rClient.SET(`${config.beta ? "beta" : "prod"}:leveling:${msg.channel.guild.id}:${message.author.id}`, (uConfig.getLevel(msg.channel.guild.id) + l).toString());
				const nlvl = config.leveling.calcLevel(uConfig.getLevel(msg.channel.guild.id));
				if (nlvl.level > lvl.level && gConfig.settings.announceLevelUp) {
					this.track("stats", "levelUp");
					if (msg.channel.permissionsOf(this.user.id).has("sendMessages")) {
						let m: Eris.Message;
						if (msg.channel.permissionsOf(this.user.id).has("embedLinks")) m = await msg.channel.createMessage({
							embed: new EmbedBuilder(gConfig.settings.lang)
								.setTitle("{lang:other.leveling.embedTitle}")
								.setDescription(`{lang:other.leveling.embedDescription|${nlvl.level}}`)
								.setFooter("{lang:other.leveling.embedFooter}")
								.setColor(Colors.green)
								.setTimestamp(new Date().toISOString())
								.setAuthor(msg.author.tag, msg.author.avatarURL)
						});
						else msg.channel.createMessage(`{lang:other.leveling.message|${msg.author.id}|${nlvl.level}}`);
						setTimeout(() => {
							try { m.delete(); } catch (e) { }
						}, 2e4);
					} else await msg.author.getDMChannel().then(dm => dm.createMessage(`{lang:other.leveling.directMessage|${nlvl.level}|${msg.channel.guild.name}}`)).catch(err => null);
				}
			}
		}
		t.end("leveling");

		t.start("mention");
		if ([`<@!${this.user.id}> `, ` <@${this.user.id}> `].includes(msg.content)) {
			this.track("stats", "mention");
			const embed =
				new EmbedBuilder(gConfig.settings.lang)
					.setTitle("{lang:other.mention.title}")
					.setColor(Math.floor(Math.random() * 0xFFFFFF))
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTimestamp(new Date().toISOString())
					.setDescription(`{ lang: other.mention.description | ${msg.author.tag}| ${gConfig.settings.prefix}| ${config.bot.addURL}| ${config.bot.supportURL} } `)
					.toJSON();

			if (!msg.channel.permissionsOf(this.user.id).has("sendMessages")) return msg.author.getDMChannel().then(dm => dm.createMessage({
				content: "I couldn't send messages in the channel where I was mentioned, so I sent this directly to you!",
				embed
			})).catch(err => null);
			else if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) return msg.channel.createMessage(`${embed.title} \n${embed.description} \n(If you give me permission to embed links this would look a lot nicer)`).catch(err => null);
			else return msg.channel.createMessage({
				embed
			}).catch(err => null);
		}
		t.end("mention");
		t.start("autoResponse");
		if (["f", "rip"].includes(msg.content.toLowerCase()) && gConfig.settings.fResponse && msg.channel.permissionsOf(this.user.id).has("sendMessages")) {
			this.track("stats", "autoResponse");
			if (!msg.channel.permissionsOf(this.user.id).has("sendMessages")) return;
			if (!config.developers.includes(msg.author.id) && !(ubl.length > 0)) {
				this.spamCounter.response.push({
					time: Date.now(),
					user: msg.author.id,
					response: "f"
				});

				const sp = [...this.spamCounter.response.filter(s => s.user === msg.author.id)];
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

					const d = fs.readdirSync(`${config.dir.logs}/spam`).filter(d => !fs.lstatSync(`${config.dir.logs}/spam/${d}`).isDirectory() && d.startsWith(msg.author.id) && d.endsWith("-response.json") && fs.lstatSync(`${config.dir.logs}/spam/${d}`).birthtimeMs + 1.2e5 > Date.now());

					if (d.length > 0) {
						report = Internal.combineReports(...d.map(f => JSON.parse(fs.readFileSync(`${config.dir.logs}/spam/${f}`).toString())), report);
						spC = report.entries.length;
						d.map(f => fs.unlinkSync(`${config.dir.logs}/spam/${f}`));
					}

					const reportId = Strings.random(10);

					fs.writeFileSync(`${config.dir.logs}/spam/${msg.author.id}-${reportId}-response.json`, JSON.stringify(report));

					await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
						embeds: [
							{
								title: `Possible Auto Response Spam From ${msg.author.tag} (${msg.author.id}) | VL: ${spC} `,
								description: `Report: ${config.beta ? `https://${config.web.api.ip}:${config.web.api.port}/reports/response/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/response/${msg.author.id}/${reportId}`} `
							}
						],
						username: `FurryBot Spam Logs${config.beta ? " - Beta" : ""}`,
						avatarURL: "https://assets.furry.bot/blacklist_logs.png"
					}).catch(err => null);

					if (spC >= config.antiSpam.response.blacklist) {
						const id = Strings.random(7);
						const expire = config.bl.getTime("response", ublB.length, true, true);
						const d = new Date(expire);
						await mdb.collection("blacklist").insertOne({
							created: Date.now(),
							type: "user",
							blame: "automatic",
							blameId: this.user.id,
							userId: msg.author.id,
							reason: "Spamming Auto Responses.",
							id,
							noticeShown: false,
							expire
						} as Blacklist.UserEntry);

						await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
							embeds: [
								{
									title: "User Blacklisted",
									description: [
										`Id: ${msg.author.id} `,
										`Tag: ${msg.author.tag} `,
										`Reason: Spamming Auto Responses.`,
										`Report: ${config.beta ? `https://${config.web.api.ip}/reports/response/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/response/${msg.author.id}/${reportId}`} `,
										`Blame: Automatic`,
										`Expiry: ${expire === 0 ? "Never" : `${Time.formatDateWithPadding(d, false)} (MM/DD/YYYY)`} `,
										`Previous Blacklists: ** ${ublB.length}** (strike ${ublB.length + 1})`
									].join("\n"),
									timestamp: new Date().toISOString(),
									color: Math.floor(Math.random() * 0xFFFFFF)
								}
							],
							username: `Blacklist Logs${config.beta ? " - Beta" : ""} `,
							avatarURL: "https://assets.furry.bot/blacklist_logs.png"
						}).catch(err => null);
					}

					return;
				}
			}
			let count = await mdb.collection("stats").findOne({ id: "fCount" }).then(res => parseInt(res.count, 10)).catch(err => 1);
			await mdb.collection("stats").findOneAndUpdate({ id: "fCount" }, { $set: { count: ++count } });
			if (msg.channel.permissionsOf(this.user.id).has("embedLinks")) return msg.channel.createMessage({
				embed: {
					title: "Paying Respects.",
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					},
					description: `** ${msg.author.username}** has paid respects.\nRespects Paid Total: ** ${count}** `,
					footer: {
						text: `This can be disabled by using "${gConfig.settings.prefix}settings f response disabled"(no quotes)`
					},
					color: Colors.gold
				}
			}); else return msg.channel.createMessage(`<@!${msg.author.id}> has paid respects.\n\nRespects paid total: ** ${count}**\n\nYou can turn this auto response off by using \`${gConfig.settings.prefix}settings f response disabled\``).catch(err => null);
		}
		t.end("autoResponse");
		if (!msg.prefix || !msg.content.toLowerCase().startsWith(msg.prefix.toLowerCase()) || msg.content.toLowerCase() === msg.prefix.toLowerCase() || !msg.cmd || !msg.cmd.cmd) return;
		const cmd = msg.cmd.cmd;

		if (!config.developers.includes(msg.author.id)) {
			this.spamCounter.command.push({
				time: Date.now(),
				user: msg.author.id,
				cmd: msg.cmd.cmd.triggers[0]
			});

			const sp = [...this.spamCounter.command.filter(s => s.user === msg.author.id)];
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

				const d = fs.readdirSync(`${config.dir.logs}/spam`).filter(d => !fs.lstatSync(`${config.dir.logs}/spam/${d}`).isDirectory() && d.startsWith(msg.author.id) && d.endsWith("-cmd.json") && fs.lstatSync(`${config.dir.logs}/spam/${d}`).birthtimeMs + 1.2e5 > Date.now());

				if (d.length > 0) {
					report = Internal.combineReports(...d.map(f => JSON.parse(fs.readFileSync(`${config.dir.logs}/spam/${f}`).toString())), report);
					spC = report.entries.length;
					d.map(f => fs.unlinkSync(`${config.dir.logs}/spam/${f}`));
				}

				const reportId = Strings.random(10);

				fs.writeFileSync(`${config.dir.logs}/spam/${msg.author.id}-${reportId}-cmd.json`, JSON.stringify(report));

				this.log("log", `Possible command spam from "${msg.author.tag}" (${msg.author.id}), VL: ${spC}, Report: ${config.beta ? `https://${config.web.api.ip}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`, `Shard #${msg.channel.guild.shard.id} | Command Handler`);
				await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
					embeds: [
						{
							title: `Possible Command Spam From ${msg.author.tag} (${msg.author.id}) | VL: ${spC}`,
							description: `Report: ${config.beta ? `https://${config.web.api.ip}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`
						}
					],
					username: `Furry Bot Spam Logs${config.beta ? " - Beta" : ""}`,
					avatarURL: "https://assets.furry.bot/blacklist_logs.png"
				});

				if (spC >= config.antiSpam.cmd.blacklist) {
					const id = Strings.random(7);
					const expire = config.bl.getTime("cmd", ublB.length, true, true);
					const d = new Date(expire);
					await mdb.collection("blacklist").insertOne({
						created: Date.now(),
						type: "user",
						blame: "automatic",
						blameId: this.user.id,
						userId: msg.author.id,
						reason: "Spamming Commands.",
						id,
						noticeShown: false,
						expire
					} as Blacklist.UserEntry);

					this.log("log", `User "${msg.author.tag}" (${msg.author.id}) blacklisted for spamming, VL: ${spC}, Report: ${config.beta ? `https://${config.web.api.ip}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`, `Shard #${msg.channel.guild.shard.id} | Command Handler`);
					await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
						embeds: [
							{
								title: "User Blacklisted",
								description: [
									`Id: ${msg.author.id}`,
									`Tag: ${msg.author.tag}`,
									`Reason: Spamming Commands.`,
									`Report: ${config.beta ? `https://${config.web.api.ip}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`,
									`Blame: Automatic`,
									`Expiry:  ${expire === 0 ? "Never" : `${Time.formatDateWithPadding(d, false)} (MM/DD/YYYY)`}`,
									`Previous Blacklists: **${ublB.length}** (strike ${ublB.length + 1})`
								].join("\n"),
								timestamp: new Date().toISOString(),
								color: Math.floor(Math.random() * 0xFFFFFF)
							}
						],
						username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
						avatarURL: "https://assets.furry.bot/blacklist_logs.png"
					});
				}
			}
		}
		if (!msg.channel.permissionsOf(this.user.id).has("sendMessages")) return msg.author.getDMChannel().then(dm => dm.createMessage(`You attempted to run the command "${msg.cmd.cmd.triggers[0]}" in the channel <#${msg.channel.id}>, but I'm missing the **sendMessages** permission.\n\nContent:\n> ${msg.content}`)).catch(err => null);

		try {
			await Promise.all(this.cmd.restrictions.filter(r => cmd.features.includes(r.name as any)).map(async (r) => r.check(msg, this, cmd, uConfig, gConfig)));
		} catch (e) {
			return;
		}

		if (cmd.botPermissions.length > 0) {
			if (cmd.botPermissions.some(perm => !msg.channel.guild.members.get(this.user.id).permission.has(perm))) {
				const p = cmd.botPermissions.filter(perm => !msg.channel.guild.members.get(this.user.id).permission.has(perm));
				if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) return msg.reply(`I am missing some permissions to be able to run that, but I need the \`embedLinks\` permission to tell you which.`).catch(err => null);
				this.log("debug", `I am missing the permission(s) ${p.join(", ")} for the command ${cmd.triggers[0]}, server: ${(msg.channel as Eris.TextChannel).guild.name} (${(msg.channel as Eris.TextChannel).guild.id})`, `Shard #${msg.channel.guild.shard.id}`);
				return msg.channel.createMessage({
					embed: {
						title: "I do not have the required permission(s) to use this!",
						description: `I need the permission(s) **${p.join("**, **")}** for this command to function properly, please add these to me and try again.`,
						color: Colors.red,
						timestamp: new Date().toISOString()
					}
				}).catch(err => null);
			}
		}

		const donator = await uConfig.premiumCheck();

		if (!config.developers.includes(msg.author.id)) {
			const cool = this.cd.check(msg.author.id, "cmd", { cmd: cmd.triggers[0] });
			const time = cool.time < 1000 ? 1000 : Math.round(cool.time / 1000) * 1000;
			if (cool.found && cmd.cooldown !== 0 && cool.time !== 0) {
				this.track("stats", "cooldownCheck");
				const t = Time.ms(time, true);
				const n = Time.ms(cmd.cooldown, true);
				const d = Time.ms(cmd.donatorCooldown, true);
				return msg.channel.createMessage({
					embed: {
						title: "Command On Cooldown",
						color: Colors.red,
						description: [
							`Please wait **${t}** before trying to use this command again!`,
							donator.active ? `You are a [donator](${config.bot.patreon}), so you get shorter cooldowns!` : `Normal users have to wait **${n}**, meanwhile [donators](${config.bot.patreon}) only have to wait **${d}**.`
						].join("\n"),
						timestamp: new Date().toISOString(),
						author: {
							name: msg.author.tag,
							icon_url: msg.author.avatarURL
						}
					}
				});
			}
		}

		if (cmd.cooldown !== 0 && !config.developers.includes(msg.author.id)) this.cd.add(msg.author.id, "cmd", donator.active ? cmd.donatorCooldown : cmd.cooldown, { cmd: cmd.triggers[0] });

		this.log("log", `Command "${cmd.triggers[0]}" ran with ${msg.unparsedArgs.length === 0 ? "no arguments" : `the arguments "${msg.unparsedArgs.join(" ")}"`} by user ${msg.author.tag} (${msg.author.id}) in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, `Shard #${msg.channel.guild.shard.id}`);
		t.start("cmd");
		this.track("stats", "commandsTotal");
		this.track("stats", "commands", cmd.triggers[0]);
		this.track("stats", "commands", "allTime", cmd.triggers[0]);
		const c = await cmd.run.call(this, msg, uConfig, gConfig, cmd).catch(err => err);
		t.end("cmd");
		this.log("debug", `Command handler for "${cmd.triggers[0]}" took ${t.calc("cmd", "cmd")}ms`, `Shard #${msg.channel.guild.shard.id}`);
		if (cmd.triggers[0] !== "eval" && msg.channel.isTyping) await msg.channel.stopTyping();
		if (c instanceof Error) throw c;
		t.end("main");
		// timing command processing
		if (msg.cmd.cat.name !== "dev") await mdb.collection("timing").insertOne({ times: t.timers, cmd: cmd.triggers[0], id: uuid.v4() });
	} catch (e) {
		const err: Error & { code?: string; } = e; // typescript doesn't allow annotating of catch clause variables, TS-1196
		if (!["ERR_INVALID_USAGE", "RETURN"].includes(err.message)) {
			this.log("error", err, msg && msg.channel && msg.channel.guild && msg.channel.guild.shard ? `Shard #${msg.channel.guild.shard.id} | Error` : `Error`);
			if (!msg || !msg.channel || !msg.channel.guild || !msg.channel.guild.shard) return;
		}
		const cmd = msg.cmd !== null ? msg.cmd.cmd : null;
		if (!cmd) return;
		switch (err.message) {
			case "ERR_INVALID_USAGE": {


				return msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle(`:x: {lang:other.error.invalidUsage.title}`)
						.setDescription([
							"**{lang:other.error.invalidUsage.info}**:",
							`\u25FD {lang:other.error.invalidUsage.command}: ${cmd.triggers[0]}`,
							`\u25FD {lang:other.error.invalidUsage.usage}: \`${gConfig.settings.prefix}${cmd.triggers[0]} ${cmd.usage}\``,
							`\u25FD {lang:other.error.invalidUsage.description}: ${cmd.description || "{lang:other.error.invalidUsage.noDescription}"}`,
							`\u25FD {lang:other.error.invalidUsage.category}: ${cmd.category}`,
							`\u25FD {lang:other.error.invalidUsage.providedArgs}: **${msg.unparsedArgs.length < 1 ? "{lang:other.error.invalidUsage.noArgs}" : msg.unparsedArgs.join(" ")}**`
						].join("\n"))
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.red)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
				}).catch(err => null);
				break;
			}

			case "RETURN": { return; break; }

			default: {
				const r = Strings.random(10);
				const ecode = `err.${cmd !== null ? cmd.triggers[0] : "general"}.${config.beta ? "beta" : "prod"}.${r}`;
				this.log("error", ecode, `Shard #${msg.channel.guild.shard.id}`);
				this.log("error", err, `Shard #${msg.channel.guild.shard.id}`);

				const s = await phin({
					method: "POST",
					url: "https://pastebin.com/api/api_post.php",
					form: {
						api_dev_key: config.keys.pastebin.devKey,
						api_user_key: config.keys.pastebin.userKey,
						api_option: "paste",
						api_paste_code: err.stack,
						api_paste_private: "2",
						api_paste_name: "Furry Bot Error",
						api_paste_expire_date: "1W"
					},
					timeout: 5e3
				}).then(k => k.body.toString());

				this.track("stats", "error");
				const embed: Eris.EmbedOptions = {
					title: ":x: Error",
					description: [
						"**Error**:",
						`\u25FD Stack: ${s}`,
						`\u25FD Error Name: ${err.name}`,
						`\u25FD Error Message: ${err.message}`,
						`\u25FD Error Code: ${err.code || "None"}`,
						"",
						"**Other Info**:",
						`\u25FD User: ${msg.author.tag} (<@!${msg.author.id}>)`,
						`\u25FD Code: \`${ecode}\``,
						`\u25FD Command: ${cmd !== null ? cmd.triggers[0] : "none"}`,
						"",
						"**Location**:",
						`\u25FD Message Content: **${msg.content}**`,
						`\u25FD Message ID: \`${msg.id}\``,
						`\u25FD Channel: **${msg.channel.name}**`,
						`\u25FD Channel ID: \`${msg.channel.id}\``,
						`\u25FD Guild: **${msg.channel.guild.name}**`,
						`\u25FD Guild ID: \`${msg.channel.guild.id}\``,
						`\u25FD Shard: #${msg.channel.guild.shard.id}`,
						`\u25FD Time: ${Time.formatDateWithPadding(Date.now(), true, false)}`
					].join("\n"),
					timestamp: new Date().toISOString(),
					color: Colors.red
				};
				let k = "";
				if (config.developers.includes(msg.author.id)) return msg.channel.createMessage({ embed });
				else {
					await this.w.get("errors").execute({
						embeds: [embed]
					});
					switch (err.code) {
						case "ECONNRESET": {
							this.track("errors", "econnreset");
							k = "{lang:other.error.econnreset}";
							break;
						}
					}
					if (!k) k = "{lang:other.error.unknown}";
					return msg.channel.createMessage(`${k}\n${Language.get(gConfig.settings.lang).get("other.error.join").format(config.bot.supportURL, ecode, err.name, err.message)}`).catch(err => null);
				}
			}
		}
	}
}));
