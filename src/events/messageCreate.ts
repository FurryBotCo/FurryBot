import ClientEvent from "../util/ClientEvent";
import Eris from "eris";
import ExtendedMessage from "../util/ExtendedMessage";
import Logger from "../util/Logger";
import EmbedBuilder from "../util/EmbedBuilder";
import Time from "../util/Functions/Time";
import { Colors } from "../util/Constants";
import CommandError from "../util/cmd/CommandError";
import config from "../config";
import { performance } from "perf_hooks";
import Redis from "../util/Redis";
import Internal from "../util/Functions/Internal";
import db, { mdb } from "../util/Database";
import Language from "../util/Language";
import crypto from "crypto";
import Timers from "../util/Timers";
import * as fs from "fs-extra";
import Utility from "../util/Functions/Utility";

export default new ClientEvent("messageCreate", async function (message, update) {
	if (config.beta && !config.developers.includes(message.author.id)) return;
	const t = new Timers(config.developers.includes(message.author.id), `${message.author.id}/${message.channel.id}`); // `${message.channel.id}/${message.id}/${message.author.id}`);
	t.start("main");
	t.start("stats.msg");
	await this.sh.processMessage(message);
	t.end("stats.msg");
	// can't do the length bit because of things like AFK
	if (message.author.bot/* || message.content.length < 2*/) return;

	/* start dm */
	t.start("dm");
	if ([Eris.Constants.ChannelTypes.DM, Eris.Constants.ChannelTypes.GROUP_DM].includes(message.channel.type as any)) {
		await this.sh.track("stats", "directMessages", "general");
		await this.sh.track("stats", "directMessages", "session");
		const inv = /((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[A-Z0-9]{1,10})/i.test(message.content);
		const e = new EmbedBuilder(config.devLanguage)
			.setTitle(`Direct Message${inv ? " Advertisment" : ""}`)
			.setDescription(message.content)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL)
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString());
		if (message.attachments?.length > 0) e.setImage(message.attachments[0].url);
		await this.w.get("directMessage").execute({
			embeds: [
				e.toJSON()
			]
		});
		return message.channel.createMessage(config.text[inv ? "inviteDM" : "normalDM"](config.devLanguage, this));

	}
	t.end("dm");
	/* end dm */

	t.start("process");
	const msg = new ExtendedMessage(message as Eris.Message<Eris.GuildTextableChannel>, this);
	const l = await msg.load(); // returns false if message does not start with prefix
	t.end("process");

	/* start blacklist */
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

				return msg.reply(Language.get(msg.gConfig.settings.lang, "other.blacklisted.guild", [b.blame, b.reason, [0, null].includes(b.expire) ? Language.get(msg.gConfig.settings.lang, "other.words.never") : Time.formatDateWithPadding(b.expire), config.urls.appealGuild(msg.channel.guild.id)]));
			}

			return;
		}
	}

	if (uBl.current.length > 0) {
		if (typeof msg.channel.guild !== "undefined" && msg.channel.guild.id === config.client.supportServerId) {
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

			return msg.reply(Language.get(msg.gConfig.settings.lang, "other.blacklisted.user", [b.blame, b.reason, [0, null].includes(b.expire) ? Language.get(msg.gConfig.settings.lang, "other.words.never") : Time.formatDateWithPadding(b.expire), config.urls.appealUser(msg.author.id)]));
		}

		return;
	} else {
		if (typeof msg.channel.guild !== "undefined" && msg.channel.guild.id === config.client.supportServerId) {
			if (msg.member.roles.includes(config.roles.blacklist)) msg.member.removeRole(config.roles.blacklist, "User is not blacklisted.");
		}
	}
	t.end("blacklist");
	/* end blacklist */


	/* start leveling */
	t.start("leveling");
	const k = await Redis.exists(`leveling:${msg.author.id}:${msg.channel.guild.id}:cooldown`).then(v => v !== 0);
	if (!k) {
		const v = await msg.uConfig.checkVote();
		await Redis.setex(`leveling:${msg.author.id}:${msg.channel.guild.id}:cooldown`, v.weekend ? 30 : 60, 1);
		const lvl = config.leveling.calcLevel(msg.uConfig.getLevel(msg.channel.guild.id));
		const j = (Math.floor(Math.random() * 10) + 5) * (v.voted ? 2 : 1);
		await msg.uConfig.edit({
			levels: {
				[msg.channel.guild.id]: msg.uConfig.getLevel(msg.channel.guild.id) + j
			}
		});
		await Redis.set(`leveling:${msg.channel.guild.id}:${message.author.id}`, (msg.uConfig.getLevel(msg.channel.guild.id) + 1).toString());
		const nlvl = config.leveling.calcLevel(msg.uConfig.getLevel(msg.channel.guild.id));
		if (nlvl.level > lvl.level && msg.gConfig.settings.announceLevelUp) {
			this.sh.track("stats", "levelUp");
			if (msg.channel.permissionsOf(this.bot.user.id).has("sendMessages")) {
				let m: Eris.Message;
				if (msg.channel.permissionsOf(this.bot.user.id).has("embedLinks")) m = await msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setTitle("{lang:other.leveling.embedTitle}")
						.setDescription(`{lang:other.leveling.embedDescription|${nlvl.level}}`)
						.setFooter("{lang:other.leveling.embedFooter}", this.bot.user.avatarURL)
						.setColor(Colors.green)
						.setTimestamp(new Date().toISOString())
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.toJSON()
				});
				else msg.channel.createMessage(`{lang:other.leveling.message|${msg.author.id}|${nlvl.level}}`);
				setTimeout(() => {
					try {
						m.delete();
					} catch (e) { }
				}, 2e4);
			} else await msg.author.getDMChannel().then(dm => dm.createMessage(`{lang:other.leveling.directMessage|${nlvl.level}|${msg.channel.guild.name}}`)).catch(err => null);
		}
	}
	t.end("leveling");
	/* end leveling */

	/* start mention */
	t.start("mention");
	if (new RegExp(`^<@!?${this.bot.user.id}>$`).test(message.content)) {
		await msg.channel.createMessage(config.text.mention(msg, this));
		return;
	}
	t.end("mention");
	/* end mention */


	/* start afk */
	// if(true) to make the variables block scoped
	t.start("afk");
	if (true) {
		const g = await Redis.get(`afk:global:${msg.author.id}`);
		const s = await Redis.get(`afk:servers:${msg.channel.guild.id}:${msg.author.id}`);
		if (g || s) {
			if (g) await Redis.del(`afk:global:${msg.author.id}`);
			if (s) await Redis.del(`afk:servers:${msg.channel.guild.id}:${msg.author.id}`);
			const embed = new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:commands.misc.afk.removed.${g ? "global" : "server"}.title}`)
				.setDescription(`{lang:commands.misc.afk.removed.${g ? "global" : "server"}.description}`)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("{lang:other.selfDestructMessage|15}", this.bot.user.avatarURL)
				.toJSON();

			let m: Eris.Message = await msg.channel.createMessage({
				embed
			}).catch(err => null);

			// assume error if value is falsey
			if (!m) m = await msg.author.getDMChannel().then(ch => ch.createMessage({ embed }).catch(err => null)).catch(err => null);

			if (m) setTimeout(() => m.delete().catch(err => null), 1.5e4);
		}

		const p: {
			id: string;
			time: number;
		}[] = [];
		const un = Array.from(new Set(msg.mentions.users));
		for (const m of un) {
			if (m.id === msg.author.id) continue;
			const g = await Redis.get(`afk:global:${m.id}`);
			const s = await Redis.get(`afk:servers:${msg.channel.guild.id}:${m.id}`);
			if (g || s) p.push({
				id: m.id,
				time: Number(g || s)
			});
		}

		if (p.length > 0) {
			const embed = new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle("{lang:commands.misc.afk.message.title}")
				.setDescription(p.map(v => `{lang:commands.misc.afk.message.description|${v.id}|${Time.formatAgo(v.time, true, false)}}`).join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.gold)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("{lang:other.selfDestructMessage|15}", this.bot.user.avatarURL)
				.toJSON();

			let m: Eris.Message = await msg.channel.createMessage({
				embed
			}).catch(err => null);

			// assume error if value is falsey
			if (!m) m = await msg.author.getDMChannel().then(ch => ch.createMessage({ embed }).catch(err => null)).catch(err => null);

			if (m) setTimeout(() => m.delete().catch(err => null), 1.5e4);
		}
	}
	t.end("afk");
	/* end afk */

	if (!l || !msg.cmd) return;

	/* start disable */
	t.start("disable");
	if (msg.gConfig.disable.length > 0 && !config.developers.includes(msg.author.id) && !msg.member.permissions.has("administrator")) {
		const a = msg.gConfig.disable.filter((d: any) => d.type === "server" && (d.all || (d.command && msg.cmd.triggers.includes(d.command.toLowerCase())) || (d.category && d.category === msg.cmd.category)));
		const b = msg.gConfig.disable.filter((d: any) => d.type === "user" && d.id === msg.author.id && (d.all || (d.command && msg.cmd.triggers.includes(d.command.toLowerCase())) || (d.category && d.category === msg.cmd.category)));
		const c = msg.gConfig.disable.filter((d: any) => d.type === "role" && msg.member.roles.includes(d.id) && (d.all || (d.command && msg.cmd.triggers.includes(d.command.toLowerCase())) || (d.category && d.category === msg.cmd.category)));
		const d = msg.gConfig.disable.filter((d: any) => d.type === "channel" && d.id === msg.channel.id && (d.all || (d.command && msg.cmd.triggers.includes(d.command.toLowerCase())) || (d.category && d.category === msg.cmd.category)));
		if (a.length > 0 || b.length > 0 || c.length > 0 || d.length > 0) return;
	}
	t.end("disable");
	/* end disable */

	/* start antispam */
	t.start("antispam");
	if (!config.developers.includes(msg.author.id)) {
		this.cmd.anti.add(msg.author.id, "command", msg.cmd.triggers[0]);

		const sp = this.cmd.anti.get(msg.author.id, "command");
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

			if (!fs.existsSync(config.dir.logs.spam)) fs.mkdirpSync(config.dir.logs.spam);

			const d = fs.readdirSync(config.dir.logs.spam).filter(d => !fs.lstatSync(`${config.dir.logs.spam}/${d}`).isDirectory() && d.startsWith(msg.author.id) && d.endsWith("-cmd.json") && fs.lstatSync(`${config.dir.logs.spam}/${d}`).birthtimeMs + 1.2e5 > Date.now());

			if (d.length > 0) {
				report = Internal.combineReports(...d.map(f => JSON.parse(fs.readFileSync(`${config.dir.logs.spam}/${f}`).toString())), report);
				spC = report.entries.length;
				d.map(f => fs.unlinkSync(`${config.dir.logs.spam}/${f}`));
			}

			const reportId = crypto.randomBytes(10).toString("hex");

			fs.writeFileSync(`${config.dir.logs.spam}/${msg.author.id}-${reportId}-cmd.json`, JSON.stringify(report));

			Logger.log([`Shard #${msg.channel.guild.shard.id}`, "Command Handler"], `Possible command spam from "${msg.author.tag}" (${msg.author.id}), VL: ${spC}, Report: ${config.beta ? `https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`);
			await this.w.get("spam").execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle(`Possible Command Spam From ${msg.author.tag} (${msg.author.id}) | VL: ${spC}`)
						.setDescription(`Report: ${`https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}`}`)
						.setTimestamp(new Date().toISOString())
						.setAuthor(`${this.bot.user.username}#${this.bot.user.discriminator}`, this.bot.user.avatarURL)
						.setColor(Colors.gold)
						.toJSON()
				],
				username: `Furry Bot Spam Logs${config.beta ? " - Beta" : ""}`,
				avatarURL: "https://i.furry.bot/furry.png"
			});

			if (spC >= config.antiSpam.cmd.blacklist) {
				const expire = config.bl.getTime("cmd", uBl.current.length, true, true);
				await db.addBl("user", msg.author.id, "automatic", this.bot.user.id, "Spamming Commands.", expire, `https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}`);
				Logger.log([`Cluster #${this.cluster.id}`, `Shard #${msg.channel.guild.shard.id}`, "Command Handler"], `User "${msg.author.tag}" (${msg.author.id}) blacklisted for spamming, VL: ${spC}, Report: https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}`);
			}
		}
	}
	t.end("antispam");
	/* end antispam */

	const { cmd } = msg;

	if (cmd) {
		t.start("stats.cmd");
		await this.sh.processCommand(msg);
		t.end("stats.cmd");

		/* start command restrictions */
		t.start("restrictions");
		if (!config.developers.includes(msg.author.id)) {
			const v = await new Promise(async (a, b) => {
				for (const r of Object.values(this.cmd.restrictions)) {
					const f = await r.test(this, msg, cmd);
					// console.log(`[${r.Label}]`, f);
					if (!f) a(false);
				}

				return a(true);
			});
			if (!v) return;
		}
		t.end("restrictions");
		/* end command restrictions */

		/* start permission checks */
		t.start("permission");
		const p = await this.cmd.handlers.checkPermissions(this, msg, cmd);
		if (!p) return;
		t.end("permission");
		/* end permission checks */

		/* start command cooldown */
		t.start("cooldown");
		if (!config.developers.includes(msg.author.id)) {
			const c = this.cmd.cool.checkCooldown(msg.author.id, cmd);
			if (c.active) {
				const j = await cmd.runOverride("cooldown", this, msg, cmd, c.time);
				if (j === "DEFAULT") {
					const m = await msg.channel.createMessage({
						embed: new EmbedBuilder(msg.gConfig.settings.lang)
							.setTitle("{lang:other.commandChecks.cooldown.title}")
							.setDescription(`{lang:other.commandChecks.cooldown.description|${Time.ms(c.time, true)}|${Time.ms(cmd.cooldown, true)}}`)
							.setColor(Colors.red)
							.setTimestamp(new Date().toISOString())
							.setFooter("{lang:other.selfDestructMessage|20}", this.bot.user.avatarURL)
							.toJSON()
					});

					setTimeout(() => m.delete().catch(err => null), 2e4);
				}

				return;
			}

			this.cmd.cool.addCooldown(msg.author.id, cmd);
		}
		t.end("cooldown");
		/* end command cooldown */

		Logger.info([`Cluster #${this.cluster.id}`, `Shard #${msg.channel.guild.shard.id}`, "Message Handler"], `Command "${cmd.triggers[0]}" ran with ${msg.args.length === 0 ? "no arguments" : `the arguments "${msg.args.join(" ")}"`} by user ${msg.author.tag} (${msg.author.id}) in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`);

		const start = performance.now();

		/* start run command */
		t.start("run");
		cmd
			.run
			.call(this, msg, cmd)
			.then(res => {
				const end = performance.now();
				Logger.info([`Cluster #${this.cluster.id}`, `Shard #${msg.channel.guild.shard.id}`, "Command Handler"], `Command handler for "${cmd.triggers[0]}" took ${(end - start).toFixed(3)}ms.`);
				if (res instanceof Error) throw res;
			})
			/* start command error handler */
			.catch(async (err: Error) => {
				const {
					code,
					message: {
						embeds: [
							e
						]
					}
				} = await Utility.logError(this, err, "message", msg);
				if (err instanceof CommandError) {
					switch (err.message) {
						case "ERR_INVALID_USAGE": {
							this.cmd.handlers.runInvalidUsage(this, msg, err.cmd, err);
							break;
						}
					}
				} else {
					if (err.message.indexOf("filterTags") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.e6Blacklist"));
					else {
						if (config.developers.includes(msg.author.id)) await msg.channel.createMessage({ embed: e });
						else await msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.command", [code, config.client.socials.discord, `${err.name}: ${err.message}`]));
					}
					Logger.error([`Cluster #${this.cluster.id}`, `Shard #${msg.channel.guild.shard.id}`, "Command Handler"], err);
				}
			});
		t.end("run");
		/* end command error handler */
		/* start run command */
	}
	t.end("main");
});
