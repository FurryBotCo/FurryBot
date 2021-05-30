import FurryBot from "../main";
import config from "../config";
import db, { Redis } from "../db";
import Blacklist from "../util/@types/Blacklist";
import TextHandler from "../util/handler/TextHandler";
import UserConfig from "../db/Models/UserConfig";
import GuildConfig from "../db/Models/GuildConfig";
import LocalFunctions from "../util/LocalFunctions";
import { ClientEvent, Colors, CommandError, EmbedBuilder, ExtendedMessage } from "core";
import { Time, Timers } from "utilities";
import Eris from "eris";
import Logger from "logger";
import * as fs from "fs-extra";
import Language from "language";
import crypto from "crypto";
import { performance } from "perf_hooks";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default new ClientEvent<FurryBot, UserConfig, GuildConfig, Eris.GuildTextableChannel>("messageCreate", async function(msg, update, slash, slashInfo) {
	if (Redis === null) return Logger.error([`Cluster #${this.clusterId}`, "messageCreate"], `Skipped a message with the id ${msg.id} due to redis not being initialized.`);

	if (!(msg instanceof ExtendedMessage)) return;
	if (msg.author.id !== "242843345402069002") return;
	const t = new Timers(config.developers.includes(msg.author.id), `${msg.author.id}/${msg.channel.id}`); // `${msg.channel.id}/${msg.id}/${msg.author.id}`);
	t.start("main");
	t.start("stats.msg");
	/* start message stats */
	this.trackNoResponse(
		this.sh.joinParts("stats", "messages", "channels", msg.channel.id),
		this.sh.joinParts("stats", "messages", "users", msg.author.id, "total"),
		this.sh.joinParts("stats", "messages", "users", msg.author.id, "servers", msg.channel.id),
		this.sh.joinParts("stats", "messages", "general"),
		this.sh.joinParts("stats", "messages", "session")
	);

	if ("guild" in msg.channel) this.trackNoResponse(
		this.sh.joinParts("stats", "messages", "servers", msg.channel.guild.id),
		this.sh.joinParts("stats", "messages", "users", msg.author.id, "servers", msg.channel.guild.id)
	);
	/* end message stats */
	t.end("stats.msg");

	if (msg.author.bot || !("type" in msg.channel)) return;

	const uBl = await db.checkBl("user", msg.author.id);

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore -- no
	if (msg.channel.type !== Eris.Constants.ChannelTypes.DM && (msg.channel).guild.id === config.client.supportServerId && msg.member !== null) {
		if (uBl.current.length === 0 && msg.member.roles.includes(config.roles.blacklist)) await msg.member.removeRole(config.roles.blacklist, "User is not blacklisted.");
		if (uBl.current.length > 0 && !msg.member.roles.includes(config.roles.blacklist)) await msg.member.addRole(config.roles.blacklist, "User is blacklisted.");
	}

	if (uBl.current.length > 0) {

		if (uBl.notice.length > 0) {
			const b = uBl.notice[0];
			await db.update<Blacklist.UserEntry>("blacklist", b.id, { noticeShown: true });

			return msg.channel.createMessage(Language.get(config.devLanguage, "other.blacklisted.user", [b.blame, b.reason, [0, null].includes(b.expire!) ? Language.get(config.devLanguage, "other.words.never") : Time.formatDateWithPadding(b.expire), config.urls.appealUser(msg.author.id)]));
		}

		return;
	}

	/* start dm */
	t.start("dm");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if ([Eris.Constants.ChannelTypes.DM, Eris.Constants.ChannelTypes.GROUP_DM].includes(msg.channel.type as unknown as any)) {
		this.trackNoResponse(
			this.sh.joinParts("stats", "directMessages", "general"),
			this.sh.joinParts("stats", "directMessages", "session")
		);
		const inv = /((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[A-Z0-9]{1,10})/i.test(msg.content);
		const e = new EmbedBuilder(config.devLanguage)
			.setTitle(`Direct Message${inv ? " Advertisment" : ""}`)
			.setDescription(msg.content)
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.avatarURL)
			.setColor(Colors.gold)
			.setTimestamp(new Date().toISOString());
		if (msg.attachments?.length > 0) {
			e.setImage(msg.attachments[0].url);
			e.addField("Attachments", msg.attachments.map((a, i) => `[[#${i + 1}](${a.url})]`).join(" "));
		}
		await this.w.get("directMessage")!.execute({
			embeds: [
				e.toJSON()
			]
		});

		const cnf = await db.getUser(msg.author.id);
		if (cnf.dmResponse) await msg.channel.createMessage(TextHandler.get(inv ? "inviteDM" : "normalDM", this, config.devLanguage));
		return;

	}
	t.end("dm");
	/* end dm */

	t.start("process");
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore -- fuck you
	const l = await msg.load(db, update, slash, slashInfo); // returns false if message does not start with prefix
	t.end("process");

	// they're messing with less cache reliance, so things can be missing
	if (!(msg.channel instanceof Eris.GuildChannel)) return;
	if (!(msg.channel.guild instanceof Eris.Guild)) return;

	/* start guild blacklist */
	t.start("guild-blacklist");
	const gBl = await db.checkBl("guild", msg.channel.guild.id);
	if (gBl.current.length > 0 && !config.developers.includes(msg.author.id)) {
		if (gBl.notice.length > 0) {
			const b = gBl.notice[0];
			await db.update<Blacklist.GuildEntry>("blacklist", b.id, { noticeShown: true });

			return msg.reply(Language.get(msg.gConfig.settings.lang, "other.blacklisted.guild", [b.blame, b.reason, [0, null].includes(b.expire!) ? Language.get(msg.gConfig.settings.lang, "other.words.never") : Time.formatDateWithPadding(b.expire), config.urls.appealGuild(msg.channel.guild.id)]));
		}

		return;
	}
	t.end("guild-blacklist");
	/* end guild blacklist */


	/* start leveling */
	t.start("leveling");
	const k = await Redis.exists(`leveling:${msg.author.id}:${msg.channel.guild.id}:cooldown`).then(v => v !== 0);
	if (!k) {
		const v = await msg.uConfig.checkVote();
		await Redis.setex(`leveling:${msg.author.id}:${msg.channel.guild.id}:cooldown`, v.weekend ? 30 : 60, 1);
		const lvl = LocalFunctions.calcLevel(msg.uConfig.getLevel(msg.channel.guild.id));
		const j = (Math.floor(Math.random() * 10) + 5) * (v.voted ? 2 : 1);
		await msg.uConfig.edit({
			[`levels.${msg.channel.guild.id}`]: msg.uConfig.getLevel(msg.channel.guild.id) + j
		});
		await Redis.set(`leveling:${msg.channel.guild.id}:${msg.author.id}`, (msg.uConfig.getLevel(msg.channel.guild.id) + 1).toString());
		const nlvl = LocalFunctions.calcLevel(msg.uConfig.getLevel(msg.channel.guild.id));
		if (nlvl.level > lvl.level) {
			const r = msg.gConfig.levelRoles.filter(h => h.level <= nlvl.level && !msg.member.roles.includes(h.role));
			for (const { role, level } of r) await msg.member.addRole(role, `Level Up Role (${level})`).catch(() => null);
			// separated for proper stats tracking
			this.trackNoResponse(
				this.sh.joinParts("stats", "levelUp")
			);
			if (msg.gConfig.settings.announceLevelUp) {
				this.trackNoResponse(
					this.sh.joinParts("stats", "levelUp", "message")
				);
				if (msg.channel.permissionsOf(this.client.user.id).has("sendMessages")) {
					let m: Eris.Message;
					if (msg.channel.permissionsOf(this.client.user.id).has("embedLinks")) m = await msg.channel.createMessage({
						embed: new EmbedBuilder(msg.gConfig.settings.lang)
							.setTitle("{lang:other.leveling.embedTitle}")
							.setDescription(`{lang:other.leveling.embedDescription|${nlvl.level}}`)
							.setFooter("{lang:other.leveling.embedFooter}", this.client.user.avatarURL)
							.setColor(Colors.green)
							.setTimestamp(new Date().toISOString())
							.setAuthor(msg.author.tag, msg.author.avatarURL)
							.toJSON()
					});
					else void msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, "other.leveling.message", [msg.author.id, nlvl.level]));
					setTimeout(() => {
						try {
							void m.delete();
						} catch (e) {
						// e
						}
					}, 2e4);
				} else {
					this.trackNoResponse(
						this.sh.joinParts("stats", "levelUp", "dm")
					);
					void msg.author.getDMChannel().then(dm => dm.createMessage(Language.get(msg.gConfig.settings.lang, "other.leveling.directMessage", [nlvl.level, ((msg.channel).guild).name]))).catch(() => null);
				}
			}
		}
	}
	t.end("leveling");
	/* end leveling */

	/* start mention */
	t.start("mention");
	if (new RegExp(`^<@!?${this.client.user.id}>$`).test(msg.content)) {
		this.trackNoResponse(
			this.sh.joinParts("stats", "mention")
		);
		return msg.channel.createMessage(TextHandler.get("mention", this, msg.gConfig.settings.lang, msg.gConfig.prefix[0], msg.author));
	}
	t.end("mention");
	/* end mention */

	/* start afk */
	t.start("afk");
	// eslint-disable-next-line no-constant-condition -- if(true) to make the variables block scoped
	if (true) {
		const s = await Redis.get(`afk:servers:${msg.channel.guild.id}:${msg.author.id}`);
		if (s) {
			this.trackNoResponse(
				this.sh.joinParts("stats", "afk", "remove"),
				this.sh.joinParts("stats", "afk", "server", "remove")
			);
			await Redis.del(`afk:servers:${msg.channel.guild.id}:${msg.author.id}`);
			const embed = new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle("{lang:commands.misc.afk.removed.title}")
				.setDescription("{lang:commands.misc.afk.removed.description}")
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.red)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("{lang:other.selfDestructMessage|15}", this.client.user.avatarURL)
				.toJSON();

			let m: Eris.Message | null = await msg.channel.createMessage({
				embed
			}).catch(() => null);

			// assume error if value is falsey
			if (!m) m = await msg.author.getDMChannel().then(ch => ch.createMessage({ embed }).catch(() => null)).catch(() => null);

			if (m) setTimeout(() => m!.delete().catch(() => null), 1.5e4);
		}

		const p: Array<{
			id: string;
			time: number;
			message?: string;
		}> = [];
		const un = Array.from(new Set(msg.mentionList.users));
		for (const m of un) {
			if (m.id === msg.author.id) continue;
			const j = await Redis.get(`afk:servers:${msg.channel.guild.id}:${m.id}`);
			if (j) {
				let v: number | { time: number; message?: string; } = Number(j) ?? JSON.parse(j);
				if (typeof v === "number") v = {
					time: v,
					message: undefined
				};
				p.push({
					id: m.id,
					...v
				});
			}
		}

		if (p.length > 0) {
			this.trackNoResponse(
				this.sh.joinParts("stats", "afk", "mention"),
				this.sh.joinParts("stats", "afk", "server", "mention")
			);
			const embed = new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle("{lang:commands.misc.afk.msg.title}")
				.setDescription(p.map(v => `{lang:commands.misc.afk.msg.description${v.message ? "Message" : ""}|${v.id}|${Time.formatAgo(v.time, true, false)}|${v.message || ""}}`).join("\n"))
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.furry)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setFooter("{lang:other.selfDestructMessage|15}", this.client.user.avatarURL)
				.toJSON();

			let m: Eris.Message | null = await msg.channel.createMessage({
				embed
			}).catch(() => null);

			// assume error if value is falsey
			if (!m) m = await msg.author.getDMChannel().then(ch => ch.createMessage({ embed }).catch(() => null)).catch(() => null);

			if (m) setTimeout(() => m!.delete().catch(() => null), 1.5e4);
		}
	}
	t.end("afk");
	/* end afk */

	if (!l || msg.cmd === null) return;

	/* start disable */
	t.start("disable");
	/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call */
	if (msg.gConfig.disable.length > 0 && !config.developers.includes(msg.author.id) && !msg.member.permissions.has("administrator")) {
		const a = msg.gConfig.disable.filter((d: any) => d.type === "server" && (d.all || (d.command && msg.cmd!.triggers.includes(d.command.toLowerCase())) || (d.category && d.category === msg.cmd!.category)));
		const b = msg.gConfig.disable.filter((d: any) => d.type === "user" && d.id === msg.author.id && (d.all || (d.command && msg.cmd!.triggers.includes(d.command.toLowerCase())) || (d.category && d.category === msg.cmd!.category)));
		const c = msg.gConfig.disable.filter((d: any) => d.type === "role" && msg.member.roles.includes(d.id) && (d.all || (d.command && msg.cmd!.triggers.includes(d.command.toLowerCase())) || (d.category && d.category === msg.cmd!.category)));
		// eslint-disable-next-line no-shadow
		const d = msg.gConfig.disable.filter((d: any) => d.type === "channel" && d.id === msg.channel.id && (d.all || (d.command && msg.cmd!.triggers.includes(d.command.toLowerCase())) || (d.category && d.category === msg.cmd!.category)));

		// server
		if (a.length > 0) return this.trackNoResponse(
			this.sh.joinParts("stats", "disable"),
			this.sh.joinParts("stats", "disable", "server")
		);
		// user
		else if (b.length > 0) return this.trackNoResponse(
			this.sh.joinParts("stats", "disable"),
			this.sh.joinParts("stats", "disable", "user")
		);
		// role
		else if (c.length > 0) return this.trackNoResponse(
			this.sh.joinParts("stats", "disable"),
			this.sh.joinParts("stats", "disable", "role")
		);
		// channel
		else if (d.length > 0) return this.trackNoResponse(
			this.sh.joinParts("stats", "disable"),
			this.sh.joinParts("stats", "disable", "channel")
		);
	}
	/* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call */
	t.end("disable");
	/* end disable */

	/* start antispam */
	t.start("antispam");
	if (!config.developers.includes(msg.author.id)) {
		this.cmd.anti.add(msg.author.id, "command", msg.cmd.triggers[0]);

		const sp = this.cmd.anti.get(msg.author.id, "command");
		let spC = sp.length;
		if (sp.length >= config.antiSpam.cmd.start && sp.length % config.antiSpam.cmd.warning === 0) {
			let report: ReturnType<typeof LocalFunctions["combineReports"]> = {
				userTag: msg.author.tag,
				userId: msg.author.id,
				generatedTimestamp: Date.now(),
				entries: sp.map(s => ({ cmd: s.command, time: s.time })),
				type: "cmd",
				beta: config.beta
			};

			if (!fs.existsSync(config.dir.logs.spam)) fs.mkdirpSync(config.dir.logs.spam);

			// eslint-disable-next-line no-shadow
			const d = fs.readdirSync(config.dir.logs.spam).filter(d => !fs.lstatSync(`${config.dir.logs.spam}/${d}`).isDirectory() && d.startsWith(msg.author.id) && d.endsWith("-cmd.json") && fs.lstatSync(`${config.dir.logs.spam}/${d}`).birthtimeMs + 1.2e5 > Date.now());

			if (d.length > 0) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				report = LocalFunctions.combineReports(...d.map(f => JSON.parse(fs.readFileSync(`${config.dir.logs.spam}/${f}`).toString())), report);
				spC = report.entries.length;
				d.map(f => fs.unlinkSync(`${config.dir.logs.spam}/${f}`));
			}

			const reportId = crypto.randomBytes(10).toString("hex");

			fs.writeFileSync(`${config.dir.logs.spam}/${msg.author.id}-${reportId}-cmd.json`, JSON.stringify(report));

			Logger.info([`Shard #${msg.channel.guild.shard.id}`, "Command Handler"], `Possible command spam from "${msg.author.tag}" (${msg.author.id}), VL: ${spC}, Report: ${config.beta ? `https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`);
			await this.w.get("spam")!.execute({
				embeds: [
					new EmbedBuilder(config.devLanguage)
						.setTitle(`Possible Command Spam From ${msg.author.tag} (${msg.author.id}) | VL: ${spC}`)
						.setDescription(`Report: ${`https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}`}`)
						.setTimestamp(new Date().toISOString())
						.setAuthor(`${this.client.user.username}#${this.client.user.discriminator}`, this.client.user.avatarURL)
						.setColor(Colors.gold)
						.toJSON()
				],
				username: `Furry Bot Spam Logs${config.beta ? " - Beta" : ""}`,
				avatarURL: "https://i.furry.bot/furry.png"
			});

			if (spC >= config.antiSpam.cmd.blacklist) {
				const expire = LocalFunctions.getBlacklistTime("cmd", uBl.current.length, true, true);
				await db.addBl("user", msg.author.id, "automatic", this.client.user.id, "Spamming Commands.", expire, `https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}`);
				Logger.info([`Cluster #${this.clusterId}`, `Shard #${msg.channel.guild.shard.id}`, "Command Handler"], `User "${msg.author.tag}" (${msg.author.id}) blacklisted for spamming, VL: ${spC}, Report: https://${config.web.api.host}/reports/cmd/${msg.author.id}/${reportId}`);
			}
		}
	}
	t.end("antispam");
	/* end antispam */

	const { cmd } = msg;

	if (cmd) {
		t.start("stats.cmd");
		this.trackNoResponse(
			this.sh.joinParts("stats", "commands", "servers", msg.channel.guild.id, "total"),
			this.sh.joinParts("stats", "commands", "servers", msg.channel.guild.id, msg.cmd.triggers[0]),
			this.sh.joinParts("stats", "commands", "channels", msg.channel.id, "total"),
			this.sh.joinParts("stats", "commands", "channels", msg.channel.id, msg.cmd.triggers[0]),
			this.sh.joinParts("stats", "commands", "users", msg.author.id, "total"),
			this.sh.joinParts("stats", "commands", "users", msg.author.id, msg.cmd.triggers[0]),
			this.sh.joinParts("stats", "commands", "users", msg.author.id, "servers", msg.channel.guild.id, "total"),
			this.sh.joinParts("stats", "commands", "users", msg.author.id, "servers", msg.channel.guild.id, msg.cmd.triggers[0]),
			this.sh.joinParts("stats", "commands", "users", msg.author.id, "channels", msg.channel.id, "total"),
			this.sh.joinParts("stats", "commands", "users", msg.author.id, "channels", msg.channel.id, msg.cmd.triggers[0]),
			this.sh.joinParts("stats", "commands", "general", "total"),
			this.sh.joinParts("stats", "commands", "general", msg.cmd.triggers[0]),
			this.sh.joinParts("stats", "commands", "session", "total"),
			this.sh.joinParts("stats", "commands", "session", msg.cmd.triggers[0])
		);
		t.end("stats.cmd");

		/* start command restrictions */
		t.start("restrictions");
		if (!config.developers.includes(msg.author.id)) {
			// eslint-disable-next-line no-async-promise-executor, @typescript-eslint/no-unused-vars
			const v = await new Promise(async (a, b) => {
				for (const r of Object.values(this.cmd.restrictions)) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore -- no
					// eslint-disable-next-line
					const f = await r.test(this, msg as any, cmd, config, Language);
					if (!f) {
						this.trackNoResponse(
							this.sh.joinParts("stats", "restrictions", r.Label)
						);
						a(false);
					}
				}

				return a(true);
			});
			if (!v) return;
		}
		t.end("restrictions");
		/* end command restrictions */

		/* start permission checks */
		t.start("permission");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const p = await this.cmd.handlers.checkPermissions(this, msg as any, cmd, config.developers);
		if (!p) return;
		t.end("permission");
		/* end permission checks */

		/* start command cooldown */
		t.start("cooldown");
		if (!config.developers.includes(msg.author.id)) {
			const c = this.cmd.cool.checkCooldown(msg.author.id, cmd);
			if (c.active) {
				this.trackNoResponse(
					this.sh.joinParts("stats", "cooldown")
				);
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const j = await cmd.runOverride("cooldown", this, msg, cmd, c.time);
				if (j === "DEFAULT") {
					const m = await msg.channel.createMessage({
						embed: new EmbedBuilder(msg.gConfig.settings.lang)
							.setTitle("{lang:other.commandChecks.cooldown.title}")
							.setDescription(`{lang:other.commandChecks.cooldown.description|${Time.ms(c.time, true)}|${Time.ms(cmd.cooldown, true)}}`)
							.setColor(Colors.red)
							.setTimestamp(new Date().toISOString())
							.setFooter("{lang:other.selfDestructMessage|20}", this.client.user.avatarURL)
							.toJSON()
					});

					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					setTimeout(() => m.delete().catch(err => null), 2e4);
				}

				return;
			}

			this.cmd.cool.addCooldown(msg.author.id, cmd);
		}
		t.end("cooldown");
		/* end command cooldown */

		Logger.info([`Cluster #${this.clusterId}`, `Shard #${msg.channel.guild.shard.id}`, `Command Handler${msg.slash ? "[Slash]" : ""}`], `Command "${cmd.triggers[0]}" ran with ${msg.args.length === 0 ? "no arguments" : `the arguments "${msg.args.join(" ")}"`} by user ${msg.author.tag} (${msg.author.id}) in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`);

		const start = performance.now();

		/* start run command */
		t.start("run");
		cmd
			.run
			.call(this, msg, cmd)
			.then(res => {
				this.trackNoResponse(
					this.sh.joinParts("stats", "commandRun", "success")
				);
				const end = performance.now();
				Logger.info([`Cluster #${this.clusterId}`, `Shard #${((msg.channel).guild).shard.id}`, `Command Handler${msg.slash ? "[Slash]" : ""}`], `Command handler for "${cmd.triggers[0]}" took ${(end - start).toFixed(3)}ms.`);
				if ((res  as Error) instanceof Error) throw res;
			})
			/* start command error handler */
			.catch(async (err: Error) => {
				this.trackNoResponse(
					this.sh.joinParts("stats", "commandRun", "fail")
				);
				const {
					code,
					message: {
						embeds: [
							e
						]
					}
				} = await LocalFunctions.logError(this, err, "message", msg);
				if (err instanceof CommandError) {
					switch (err.message) {
						case "INVALID_USAGE": {
							void this.cmd.handlers.runInvalidUsage(this, msg, err.cmd, err);
							break;
						}
					}
				} else {
					if (err.message.indexOf("filterTags") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.e6Blacklist"));
					else {
						if (config.developers.includes(msg.author.id)) await (msg.channel).createMessage({ embed: e });
						else await msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.command", [code, config.client.socials.discord, `${err.name}: ${err.message}`]));
					}
					Logger.error([`Cluster #${this.clusterId}`, `Shard #${(msg.channel).guild.shard.id}`, "Command Handler"], err);
				}
			});
		t.end("run");
		/* end command error handler */
		/* start run command */
	}
	t.end("main");
});
