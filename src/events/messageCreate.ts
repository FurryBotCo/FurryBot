import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import Eris from "eris";
import ExtendedMessage from "../modules/ExtendedMessage";
import GuildConfig from "../modules/config/GuildConfig";
import UserConfig from "../modules/config/UserConfig";
import Timers from "../util/Timers";
import config from "../config";
import db, { mdb } from "../modules/Database";
import Language from "../util/Language";
import { Time, Strings, Internal } from "../util/Functions";
import EmbedBuilder from "../util/EmbedBuilder";
import { Colors } from "../util/Constants";
import { Redis } from "../modules/External";
import * as fs from "fs-extra";
import phin from "phin";
import APIError from "dankmemerapi/build/APIError";
import { RestrictionError } from "../config/extra/other/commandRestrictions";

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

		if (!message || !message.author || message.author.bot || (config.beta && !(config.developers.includes(message.author.id) || config.contributors.includes(message.author.id) || config.helpers.includes(message.author.id))) || !this.firstReady || message.content.length < 2 /* suggestion from Kirb#1900 */) return;

		t.start("messageProcess");
		msg = new ExtendedMessage(message, this);
		t.end("messageProcess");

		t.start("blacklist");
		let gBl: { [k in "all" | "expired" | "current" | "notice"]: Blacklist.GenericEntry[]; };
		const uBl = await db.checkBl("user", msg.author.id);

		if (typeof msg.channel.guild !== "undefined") {
			gBl = typeof msg.channel.guild !== "undefined" ? await db.checkBl("guild", msg.channel.guild.id) : null;
			if (gBl.current.length > 0) {
				if (gBl.notice.length > 0) {
					const b = gBl.notice[0];
					await mdb.collection<Blacklist.GuildEntry>("blacklist").findOneAndUpdate({
						id: b.id
					}, {
						$set: {
							noticeShown: true
						}
					});

					return msg.reply(`{lang:other.blacklisted.guild|${b.blame}|${b.reason}|${[0, null].includes(b.expire) ? Language.get("en").get("other.words.never") : Time.formatDateWithPadding(b.expire)}|${config.urls.appealGuild(msg.channel.guild.id)}}`);
				}

				return;
			}
		}

		if (uBl.current.length > 0) {
			if (typeof msg.channel.guild !== "undefined" && msg.channel.guild.id === config.client.mainGuild) {
				if (!msg.member.roles.includes(config.roles.blacklist)) msg.member.addRole(config.roles.blacklist, "User is blacklisted.");
			}

			if (uBl.notice.length > 0) {
				const b = uBl.notice[0];
				await mdb.collection<Blacklist.UserEntry>("blacklist").findOneAndUpdate({
					id: b.id
				}, {
					$set: {
						noticeShown: true
					}
				});

				return msg.reply(`{lang:other.blacklisted.user|${b.blame}|${b.reason}|${[0, null].includes(b.expire) ? Language.get("en").get("other.words.never") : Time.formatDateWithPadding(b.expire)}|${config.urls.appealUser(msg.author.id)}}`);
			}

			return;
		} else {
			if (typeof msg.channel.guild !== "undefined" && msg.channel.guild.id === config.client.mainGuild) {
				if (msg.member.roles.includes(config.roles.blacklist)) msg.member.removeRole(config.roles.blacklist, "User is not blacklisted.");
			}
		}

		t.end("blacklist");

		t.start("dm");
		// needed due to everything else being GuildTextableChannel
		if ((message.channel as unknown as Eris.PrivateChannel).type === Eris.Constants.ChannelTypes.DM) {
			this.track("stats", "directMessage");

			if (/discord\.gg/gi.test(msg.content.toLowerCase())) {
				this.track("stats", "directMessageInvite");
				// being more constructive instead of outright banning
				// const g = await this.getRESTGuild(config.bot.mainGuild);
				// await g.banMember(message.author.id, 0, "Advertising in bots dms.");

				await this.w.get("directMessage").execute({
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
					avatarURL: config.images.botIcon
				});

				await msg.author.getDMChannel().then(dm => dm.createMessage(config.directMessage.invite)).catch(err => null);
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
					avatarURL: config.images.botIcon
				});

				await msg.author.getDMChannel().then(dm => dm.createMessage(config.directMessage.normal));
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
		if (this.lvl.check(`leveling-${msg.author.id}-${msg.channel.guild.id}`)) return;
		this.lvl.add(`leveling-${msg.author.id}-${msg.channel.guild.id}`, 6e4);
		const lvl = config.leveling.calcLevel(uConfig.getLevel(msg.channel.guild.id));
		const l = Math.floor(Math.random() * 10) + 5;
		await uConfig.edit({
			levels: {
				[msg.channel.guild.id]: uConfig.getLevel(msg.channel.guild.id) + l
			}
		});
		await Redis.SET(`${config.beta ? "beta" : "prod"}:leveling:${msg.channel.guild.id}:${message.author.id}`, (uConfig.getLevel(msg.channel.guild.id) + l).toString());
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
						.toJSON()
				});
				else msg.channel.createMessage(`{lang:other.leveling.message|${msg.author.id}|${nlvl.level}}`);
				setTimeout(() => {
					try { m.delete(); } catch (e) { }
				}, 2e4);
			} else await msg.author.getDMChannel().then(dm => dm.createMessage(`{lang:other.leveling.directMessage|${nlvl.level}|${msg.channel.guild.name}}`)).catch(err => null);
		}
		t.end("leveling");

		t.start("mention");
		if ([`<@!${this.user.id}>`, `<@${this.user.id}>`].includes(msg.content)) {
			this.track("stats", "mention");
			const embed = new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:other.mention.title}")
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setDescription(`{lang:other.mention.description|${msg.author.tag}|${gConfig.settings.prefix}|${config.client.invite.url}|${config.client.socials.discord}}`)
				.toJSON();

			if (!msg.channel.permissionsOf(this.user.id).has("sendMessages")) return msg.author.getDMChannel().then(dm => dm.createMessage({
				content: Language.get(gConfig.settings.lang).get("other.mention.dm").toString(),
				embed
			})).catch(err => null);
			else if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) return msg.channel.createMessage(`${embed.title} \n${embed.description} \n(If you give me permission to embed links this would look a lot nicer)`).catch(err => null);
			else return msg.channel.createMessage({
				embed
			}).catch(err => null);
		}
		t.end("mention");

		if (!msg.prefix || !msg.content.toLowerCase().startsWith(msg.prefix.toLowerCase()) || msg.content.toLowerCase() === msg.prefix.toLowerCase() || !msg.cmd || !msg.cmd.cmd) return;
		const cmd = msg.cmd.cmd;

		if (gConfig.disable.length > 0 && !config.developers.includes(msg.author.id) && !msg.member.permission.has("administrator")) {
			const a = gConfig.disable.filter((d: any) => d.type === "server" && (d.all || (!!d.command && cmd.triggers.includes(d.command.toLowerCase())) || (!!d.category && d.category === cmd.category)));
			const b = gConfig.disable.filter((d: any) => d.type === "user" && d.id === msg.author.id && (d.all || (!!d.command && cmd.triggers.includes(d.command.toLowerCase())) || (!!d.category && d.category === cmd.category)));
			const c = gConfig.disable.filter((d: any) => d.type === "role" && msg.member.roles.includes(d.id) && (d.all || (!!d.command && cmd.triggers.includes(d.command.toLowerCase())) || (!!d.category && d.category === cmd.category)));
			const d = gConfig.disable.filter((d: any) => d.type === "channel" && d.id === msg.channel.id && (d.all || (!!d.command && cmd.triggers.includes(d.command.toLowerCase())) || (!!d.category && d.category === cmd.category)));
			if (a.length > 0 || b.length > 0 || c.length > 0 || d.length > 0) return;
		}

		if (!config.developers.includes(msg.author.id)) {
			this.cmd.antiSpamHandler.add(msg.author.id, "command", cmd.triggers[0]);

			const sp = this.cmd.antiSpamHandler.get(msg.author.id, "command");
			let spC = sp.length;
			if (sp.length >= config.antiSpam.cmd.start && sp.length % config.antiSpam.cmd.warning === 0) {
				let report: any = {
					userTag: msg.author.tag,
					userId: msg.author.id,
					generatedTimestamp: Date.now(),
					entries: sp.map(s => ({ cmd: s.command, time: s.time })),
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
				await this.w.get("logs").execute({
					embeds: [
						{
							title: `Possible Command Spam From ${msg.author.tag} (${msg.author.id}) | VL: ${spC}`,
							description: `Report: ${`https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}`}`
						}
					],
					username: `Furry Bot Spam Logs${config.beta ? " - Beta" : ""}`,
					avatarURL: config.images.blacklistLogs
				});

				if (spC >= config.antiSpam.cmd.blacklist) {
					const expire = config.bl.getTime("cmd", uBl.current.length, true, true);
					await uConfig.addBlacklist("automatic", this.user.id, "Spamming Commands.", expire, `https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}`);

					this.log("log", `User "${msg.author.tag}" (${msg.author.id}) blacklisted for spamming, VL: ${spC}, Report: https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}`, `Shard #${msg.channel.guild.shard.id} | Command Handler`);
				}
			}
		}

		try {
			await Promise.all(this.cmd.restrictions.filter(r => cmd.restrictions.includes(r.name as any)).map(async (r) => r.check(msg, this, cmd, uConfig, gConfig)));
		} catch (e) { if (e instanceof RestrictionError) return; else throw e; }

		if (cmd.permissions.user.length > 0) {
			if (cmd.permissions.user.some(perm => !msg.member.permission.has(perm))) {
				const p = cmd.permissions.user.filter(perm => !msg.member.permission.has(perm));
				if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) return msg.reply(Language.get(gConfig.settings.lang, "other.permissions.user.noEmbed", false)).catch(err => null);
				return msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle("{lang:other.permissions.user.embedTitle}")
						.setDescription(`{lang:other.permissions.user.embedDescription|${p.join("**, **")}}`)
						.setColor(Colors.red)
						.setTimestamp(new Date().toISOString())
						.toJSON()
				}).catch(err => null);
			}
		}

		if (cmd.permissions.bot.length > 0) {
			if (cmd.permissions.bot.some(perm => !msg.channel.guild.me.permission.has(perm))) {
				const p = cmd.permissions.bot.filter(perm => !msg.channel.guild.me.permission.has(perm));
				if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) return msg.reply(Language.get(gConfig.settings.lang, "other.permissions.bot.noEmbed", false)).catch(err => null);
				this.log("debug", `I am missing the permission(s) ${p.join(", ")} for the command ${cmd.triggers[0]}, server: ${(msg.channel as Eris.TextChannel).guild.name} (${(msg.channel as Eris.TextChannel).guild.id})`, `Shard #${msg.channel.guild.shard.id}`);
				return msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle("{lang:other.permissions.bot.embedTitle}")
						.setDescription(`{lang:other.permissions.bot.embedDescription|${p.join("**, **")}}`)
						.setColor(Colors.red)
						.setTimestamp(new Date().toISOString())
						.toJSON()
				}).catch(err => null);
			}
		}

		const donator = await uConfig.premiumCheck();

		if (!config.developers.includes(msg.author.id)) {
			const cool = this.cmd.cooldownHandler.get(msg.author.id, cmd.triggers[0]);
			const time = !cool ? 0 : cool.time < 1000 ? 1000 : Math.round(cool.time / 1000) * 1000;
			if (!!cool && !isNaN(time) && cmd.cooldown !== 0 && cool.time !== 0) {
				const t = Time.ms(time, true);
				const n = Time.ms(cmd.cooldown, true);
				const d = Time.ms(cmd.donatorCooldown, true);

				return msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle("{lang:other.cooldown.title}")
						.setColor(Colors.red)
						.setDescription([
							`{lang:other.cooldown.desc|${t}}`,
							cmd.cooldown === cmd.donatorCooldown ? "" : donator.active ? `{lang:other.cooldown.donatorActive|${config.client.socials.patreon}}` : `{lang:other.cooldown.donatorInactive|${n}|${config.client.socials.patreon}|${d}}`
						].join("\n"))
						.setTimestamp(new Date().toISOString())
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.toJSON()
				});
			}
		}

		if (cmd.cooldown !== 0 && !config.developers.includes(msg.author.id)) this.cmd.cooldownHandler.add(msg.author.id, cmd.triggers[0], donator.active ? cmd.donatorCooldown : cmd.cooldown);
		const a = msg.content.slice(msg.prefix.length).trim().split(" ")[0];

		this.log("log", `Command "${cmd.triggers[0]}"${a !== cmd.triggers[0] ? ` (alias used: ${a})` : ""} ran with ${msg.unparsedArgs.length === 0 ? "no arguments" : `the arguments "${msg.unparsedArgs.join(" ")}"`} by user ${msg.author.tag} (${msg.author.id}) in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, `Shard #${msg.channel.guild.shard.id}`);
		t.start("cmd");
		this.track("stats", "commandsTotal");
		this.track("stats", "commandsAllTime");
		this.track("stats", "commands", cmd.triggers[0]);
		this.track("stats", "commands", "allTime", cmd.triggers[0]);
		const c = await cmd.run.call(this, msg, uConfig, gConfig, cmd).catch(err => err);
		t.end("cmd");
		this.log("debug", `Command handler for "${cmd.triggers[0]}" took ${t.calc("cmd", "cmd")}ms`, `Shard #${msg.channel.guild.shard.id}`);
		if (cmd.triggers[0] !== "eval" && msg.channel.isTyping) await msg.channel.stopTyping();
		if (c instanceof Error) throw c;
		t.end("main");

		if (msg.cmd.cat.name !== "dev") await mdb.collection("timing").insertOne({ times: t.timers, cmd: cmd.triggers[0], id: Strings.random(32) });
	} catch (e) {
		const err: Error & { code?: string; } = e; // typescript doesn't allow annotating of catch clause variables, TS-1196
		if (!["ERR_INVALID_USAGE", "RETURN"].includes(err.message)) {
			this.log("error", err, msg && msg.channel && msg.channel.guild && msg.channel.guild.shard ? `Shard #${msg.channel.guild.shard.id} | Error` : `Error`);
			if (!msg || !msg.channel || !msg.channel.guild || !msg.channel.guild.shard) return;
		}
		const cmd = msg.cmd !== null ? msg.cmd.cmd : null;
		if (!cmd) return;

		if (cmd.category === "meme" && err instanceof APIError && typeof err.body !== "undefined") return msg.reply(`{lang:other.errors.dankMemer|${err.body.serverError.status}|${err.body.serverError.error}}`);

		switch (err.message) {
			case "ERR_INVALID_USAGE": {
				return msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle(`:x: {lang:other.errors.invalidUsage.title}`)
						.setDescription([
							"**{lang:other.errors.invalidUsage.info}**:",
							`\u25FD {lang:other.errors.invalidUsage.command}: ${cmd.triggers[0]}`,
							`\u25FD {lang:other.errors.invalidUsage.usage}: \`${gConfig.settings.prefix}${cmd.triggers[0]} ${cmd.usage}\``,
							`\u25FD {lang:other.errors.invalidUsage.description}: ${cmd.description || "{lang:other.errors.invalidUsage.noDescription}"}`,
							`\u25FD {lang:other.errors.invalidUsage.category}: ${cmd.category}`,
							`\u25FD {lang:other.errors.invalidUsage.providedArgs}: **${msg.unparsedArgs.length < 1 ? "{lang:other.errors.invalidUsage.noArgs}" : msg.unparsedArgs.join(" ")}**`
						].join("\n"))
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.red)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.toJSON()
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
						api_dev_key: config.apiKeys.pastebin.devKey,
						api_user_key: config.apiKeys.pastebin.userKey,
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
					return msg.channel.createMessage(`${k}\n${Language.get(gConfig.settings.lang).get("other.error.join").format(config.client.socials.discord, ecode, err.name, err.message)}`).catch(err => null);
				}
			}
		}
	}
}));
