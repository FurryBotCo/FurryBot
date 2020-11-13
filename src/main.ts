import * as fs from "fs-extra";
import ClientEvent from "./util/ClientEvent";
import Logger from "./util/Logger";
import path from "path";
import Category from "./util/cmd/Category";
import CommandHandler from "./util/cmd/CommandHandler";
import WebhookStore from "./util/WebhookStore";
import PollHandler from "./util/handlers/PollHandler";
import ModLogUtil from "./util/ModLogUtil";
import TimedActionsHandler from "./util/handlers/TimedActionsHandler";
import StatsHandler from "./util/handlers/StatsHandler";
import MusicHandler from "./util/handlers/music/MusicHandler";
import MessageCollector from "./util/MessageCollector";
import API from "./api";
import Base from "./clustering/Base";
import Cluster from "./clustering/Cluster";
import config from "./config";
import TimedTasks from "./util/Functions/TimedTasks";
import { performance } from "perf_hooks";
import "./util/MonkeyPatch";
import Eris from "eris";
import BLClient from "./util/handlers/BotListHandler";
import phin from "phin";
import db from "./util/Database";
import Request from "./util/Functions/Request";
import Utility from "./util/Functions/Utility";

// create log directories if they don't exist
for (const l of Object.keys(config.dir.logs)) if (!fs.existsSync(config.dir.logs[l])) fs.mkdirpSync(config.dir.logs[l]);

class FurryBot extends Base {
	cmd: CommandHandler;
	firstReady: boolean;
	w: WebhookStore;
	p: PollHandler;
	t: TimedActionsHandler;
	m: ModLogUtil;
	col: MessageCollector;
	sh: StatsHandler;
	music: MusicHandler;
	events: Map<string, {
		handler: (...args: any[]) => void;
		event: ClientEvent;
	}>;
	v: {
		[k in "awoo" | "conga" | "furpile"]: {
			[k: string]: {
				timeout: NodeJS.Timeout;
				users: string[];
			};
		}
	};
	api: API;
	e6Active: string[];
	// this is stored here to avoid making the info command take at least 1 second on each run
	// will this make it inaccurate? Well yes, of course, but it makes the command not sit there stalling,
	// waiting for the test to finish
	cpuUsage: number;
	counters: {
		type: FurryBot["POSSIBLE_COUNTERS"][number];
		time: number;
	}[];
	POSSIBLE_COUNTERS = [
		"guildMemberAdd",
		"guildMemberRemove",
		"messageCreate",
		"messageDelete",
		"messageDeleteBulk",
		"messageUpdate",
		"userUpdate"
	];
	constructor(d: Cluster) {
		super(d);
		this.m = new ModLogUtil(this);
		this.firstReady = false;
		this.sh = new StatsHandler(this);
		this.events = new Map();
		this.v = {
			awoo: {},
			conga: {},
			furpile: {}
		};
		this.api = new API(this);
		this.cpuUsage = 0;
		this.e6Active = [];
		this.counters = [];
		db.setClient(this);
	}

	removeOldCounters() {
		const d = Date.now();
		for (const [i, v] of this.counters.entries()) if (v.time + 3e4 < d) this.counters.splice(i, 1);
	}

	async loadCommands() {
		const start = performance.now();
		Logger.debug([`Cluster #${this.cluster.id}`, "Command Handler"], "Loading commands.");
		const c = fs.readdirSync(`${__dirname}/commands`);
		for (const f of c) {
			let cat;
			try {
				cat = await import(`${__dirname}/commands/${f}/index.${__filename.split(".").slice(-1)[0]}`);
				if (cat.default) cat = cat.default;
			} catch (e) {
				console.error(e);
			}

			if (cat instanceof Category) this.cmd.addCategory(cat);
			else throw new TypeError(`Missing or Invalid index in category "${f}" (${path.resolve(`${__dirname}/commands/${f}`)})`);
		}
		const end = performance.now();

		Logger.debug([`Cluster #${this.cluster.id}`, "Command Handler"], `Finished loading ${this.cmd.commands.length} commands in ${(end - start).toFixed(3)}ms.`);
	}

	async loadEvents(removeAll: boolean) {
		const start = performance.now();
		if (removeAll) {
			this.bot.removeAllListeners();
			Logger.debug([`Cluster #${this.cluster.id}`, "Event Loader"], "Removing all listeners before loading events.");
		}
		const events = fs.readdirSync(`${__dirname}/events`);

		for (const event of events) {
			let e = await import(`${__dirname}/events/${event}`);
			if (e.default) e = e.default;
			if (e instanceof ClientEvent) {
				if (this.events.has(e.event)) this.bot.off(e.event, this.events.get(e.event).handler);
				const handler = (...d) => e.handle(this, ...d);
				this.events.set(e.event, {
					handler,
					event: e
				});
				this.bot.on(e.event, handler);
				Logger.debug([`Cluster #${this.cluster.id}`, "Event Loader"], `Loaded the event "${e.event}".`);
			} else {
				Logger.error([`Cluster #${this.cluster.id}`, "Event Loader"], `Error loading the event file "${event}", export is not an instance of ClientEvent.`);
				continue;
			}
		}
		const end = performance.now();

		Logger.debug([`Cluster #${this.cluster.id}`, "Event Loader"], `Finished loading ${events.length} events in ${(end - start).toFixed(3)}ms.`);
	}

	async launch(shards: number) {
		const start = performance.now();
		await this.sh.resetSessionStats();
		await this.loadEvents(true);
		this.cmd = new CommandHandler(this);
		this.w = new WebhookStore(this);
		this.p = new PollHandler(this);
		this.t = new TimedActionsHandler(this);
		this.col = new MessageCollector(this);
		this.music = new MusicHandler(this);

		if (this.cluster.id === 0) this.api.launch();
		await this.loadCommands();

		const s = config.statuses(this);

		await this.bot.editStatus(s[0].status, {
			name: s[0].name,
			type: s[0].type
		});

		setInterval(async () => {
			TimedTasks.runAll.bind(TimedTasks, this);
			this.t.processEntries();
			const d = new Date();
			const stats = await this.ipc.getStats();
			const s = config.statuses(this, stats);
			const st = s.find(t => t.filter(d.getHours(), d.getMinutes(), d.getSeconds()));
			if (!st) return;
			else {
				await this.bot.editStatus(st.status, {
					name: st.name,
					type: st.type
				});
			}
		}, 1e3);

		// explination in index.ts
		setInterval(async () => {
			this.cpuUsage = await Utility.getCPUUsage();
		}, 5e3);

		setInterval(() => TimedTasks.runAll(this), 1e3);

		if (!config.beta) {
			BLClient
				.on("beforePost", async () => {
					BLClient.update(this.bot.guilds.size, this.bot.shards.map(s => ({
						id: s.id,
						count: this.bot.guilds.filter(g => g.shard.id === s.id).length
					})).reduce((a, b) => a.concat(b), []));
					await phin({
						method: "POST",
						url: "https://top.gg/api/bots/398251412246495233/stats",
						headers: {
							"Authorization": config.client.botLists["top.gg"].token,
							"User-Agent": config.web.userAgent
						},
						data: {
							server_count: this.bot.guilds.size,
							shards: this.bot.shards.map(s => this.bot.guilds.filter(g => g.shard.id === s.id).length)
						} as any
					}).then(res => {
						Logger.debug(["Bot List Stats", "DBL"], res.statusCode === 200 ? "Successfully posted stats" : "failed to post stats");
						if (res.statusCode !== 200) Logger.error(["Bot List Stats", "DBL"], res.body.toString());
					});
				})
				.on("afterPost", (successful, failed) =>
					Logger.debug("Bot List Stats", `Finished posting to ${successful + failed} lists. ${successful} succeeded, ${failed} failed.`)
				)
				.on("error", (err) =>
					Logger.error("Bot List Stats", err)
				)
				.start();
		}

		setTimeout(this.removeOldCounters.bind(this), 1e3);

		const end = performance.now();
		Logger.info([`Cluster #${this.cluster.id}`, "General"], `Ready with ${this.bot.guilds.size} guild${this.bot.guilds.size === 1 ? "" : "s"}, ${this.bot.users.size} user${this.bot.users.size === 1 ? "" : "s"}, and ${Object.keys(this.bot.channelGuildMap).length} guild channel${Object.keys(this.bot.channelGuildMap).length === 1 ? "" : "s"}. Launch processing took ${(end - start).toFixed(3)}ms.`);

		super.done();
	}

	async getUser(id: string) {
		if (this.bot.users.has(id)) return this.bot.users.get(id);
		const user: Eris.User = await this.bot.getRESTUser(id).catch(err => null);
		if (user) {
			this.bot.users.set(id, user);
			return user;
		} else return null;
	}

	async getGuild(id: string) {
		if (this.bot.guilds.has(id)) return this.bot.guilds.get(id);
		const guild: Eris.Guild = await this.bot.getRESTGuild(id).catch(err => null);
		return guild || null;
	}

	get createPaste() {
		return Request.createPaste;
	}
}

export default FurryBot;
/*
process
	.on("uncaughtException", (err) => Logger.error("Uncaught Exception", err))
	.on("unhandledRejection", (err, p) => Logger.error("Unhandled Rejection", err));
*/
