/// <reference path="./util/@types/eris-fleet.d.ts" />
/// <reference path="./util/@types/global.d.ts" />
import Eris from "eris";
import config from "./config";
import Logger from "./util/LoggerV10";
import { DataDog, Redis } from "./modules/External";
import WebhookStore from "./modules/Holders/WebhookStore";
import Holder from "./modules/Holders/Holder";
import MessageCollector from "./util/MessageCollector";
import CommandHandler from "./modules/CommandHandler/CommandHandler";
import ModLogUtil from "./util/ModLogUtil";
import API from "./api";
import ClientEvent from "./util/ClientEvent";
import * as fs from "fs-extra";
import HolderV2 from "./modules/Holders/HolderV2";
import { Node } from "lavalink";
import Collection from "./util/Collection";
import MusicQueue from "./util/MusicQueue";
import { BaseClusterWorker } from "eris-fleet";
import { Strings } from "./util/Functions";
import { performance } from "perf_hooks";
import { exit } from "process";

const ew = process.emitWarning;
process.emitWarning = ((w, name, code) => {
	if (w.toString().indexOf("NODE_TLS_REJECT_UNAUTHORIZED") !== -1) return;
	else return ew(w, name, code);
});

class EvalError extends Error {
	code: string;
	constructor(message: string, name: string, stack: string, code: string) {
		super(message);
		this.name = name;
		this.stack = stack;
		this.code = code;
	}
}

export default class FurryBot extends BaseClusterWorker {
	holder: Holder;
	lvl: HolderV2;
	c: MessageCollector;
	w: WebhookStore;
	m: ModLogUtil;
	cmd: CommandHandler;
	api: API;
	firstReady: boolean;
	v: Node;
	q: Collection<MusicQueue>;
	bot: Eris.Client;
	cb: Map<string, {
		resolve: (...args: any[]) => any;
		reject: (...args: any[]) => any;
	}>;
	constructor(setup) {
		super(setup);
		this.holder = new Holder();
		this.lvl = new HolderV2();
		global.console.log = Logger.log.bind(null, "General");
		global.console.error = Logger.error.bind(null, "General");
		global.console.warn = Logger.warn.bind(null, "General");
		global.console.debug = Logger.debug.bind(null, "General");

		process
			.on("uncaughtException", (err) => {
				this.log("error", err, "Uncaught Exception");
			})
			.on("unhandledRejection", (reason, promise) => {
				this.log("error", reason, "Unhandled Rejection");
				this.log("error", promise, "Unhandled Rejection");
				if (reason instanceof Error && reason.name === "TriggerDuplicationError") {
					this.log("error", "Exiting after a TriggerDuplicationError.", "Unhandled Rejection");
					process.exit(1);
				}
			})
			.on("rejectionHandled", (p) => {
				console.log(p);
			});

		this.c = new MessageCollector(this);
		this.w = new WebhookStore(this);
		this.m = new ModLogUtil(this);
		this.cmd = new CommandHandler(this);
		this.api = new API(this);
		this.firstReady = false;
		this.q = new Collection();
		this.cb = new Map();

		this.setup();
	}

	async evalAtCluster<T = string>(id: number, code: string): Promise<{
		time: {
			start: number;
			end: number;
			total: number;
		};
		result: T;
	}> {
		return new Promise((a, b) => {
			const resId = Strings.random(15);
			this.ipc.sendTo(id, "eval", {
				code,
				clusterId: this.clusterID,
				resId
			} as EvalMessage["msg"]);

			this.cb.set(resId, {
				resolve: (...args) => (this.cb.delete(resId), a(...args)),
				reject: (...args) => (this.cb.delete(resId), b(...args))
			});
		}).catch(err => {
			console.error(err);
			console.error(`Code: ${err.code}`);
			throw err;
		}) as any;
	}

	async broadcastEval(code: string): Promise<ThenArg<ReturnType<this["evalAtCluster"]>>[]> {
		const count = Number(config.client.options.clusters) || 1;
		const clusters = [];
		for (let i = 0; i < count; i++) clusters.push(i);

		return Promise.all(clusters.map(c => this.evalAtCluster(c, code))) as any;
	}

	async reload(type: "command" | "category", data: string) {
		const count = Number(config.client.options.clusters) || 1;
		for (let i = 0; i < count; i++) this.ipc.sendTo(i, "reload", { type, data });

		return true;
	}

	async getStats(): Promise<Stats> {
		const ipcStats = await this.ipc.getStats();
		const c = [];
		const count = Number(config.client.options.clusters) || 1;
		for (let i = 0; i < count; i++) c.push({ // I could shove this all into one eval but it looks too messy
			guilds: await this.evalAtCluster<number>(i, "this.bot.guilds.size").then(res => res.result),
			users: await this.evalAtCluster<number>(i, "this.bot.users.size").then(res => res.result),
			channels: await this.evalAtCluster<number>(i, "Object.keys(this.bot.channelGuildMap).length").then(res => res.result),
			uptime: ipcStats.clusters[i].uptime,
			voice: await this.evalAtCluster<number>(i, "this.bot.voiceConnections.size").then(res => res.result),
			largeGuilds: await this.evalAtCluster<number>(i, "this.bot.guilds.filter(g => g.large).length").then(res => res.result),
			shards: await this.evalAtCluster<number[]>(i, "this.bot.shards.map(s => s.id)").then(res => Promise.all(res.result.map(async (id) => ({
				ready: await this.evalAtCluster<boolean>(i, `this.bot.shards.get(${id}).ready`).then(res => res.result),
				latency: await this.evalAtCluster<number>(i, `this.bot.shards.get(${id}).latency`).then(res => res.result),
				status: await this.evalAtCluster<Eris.Shard["status"]>(i, `this.bot.shards.get(${id}).status`).then(res => res.result),
				guilds: await this.evalAtCluster<number>(i, `this.bot.guilds.filter(g => g.shard.id === ${id}).length`).then(res => res.result),
				users: await this.evalAtCluster<number>(i, `this.bot.guilds.filter(g => g.shard.id === ${id}).reduce((a,b) => b.memberCount + a, 0)`).then(res => res.result)
			})))),
			ram: ipcStats.clusters[i].ram
		});

		return {
			get guilds() { return this.clusters.reduce((a, b) => b.guilds + a, 0); },
			get users() { return this.clusters.reduce((a, b) => b.users + a, 0); },
			get largeGuilds() { return this.clusters.reduce((a, b) => b.largeGuilds + a, 0); },
			get channels() { return this.clusters.reduce((a, b) => b.channels + a, 0); },
			get voice() { return this.clusters.reduce((a, b) => b.voice + a, 0); },
			ram: {
				get clusters() { return this.clusters.reduce((a, b) => b.ram + a, 0); },
				services: ipcStats.servicesRam,
				master: ipcStats.masterRam,
				total: ipcStats.totalRam
			},
			clusters: c,
			get shards() { return this.clusters.reduce((a, b) => a.concat(b), []); },
			services: ipcStats.services.map(s => ({ [s.name]: s.ram })).reduce((a, b) => ({ ...a, ...b }), {})
		};
	}

	registerEvent(ev: string, cb: (...args: any) => any) {
		this.ipc.register(ev, cb);
		return this;
	}

	unregisterEvent(ev: string) {
		this.ipc.unregister(ev);
		return this;
	}

	// because they don't construct this until the cluster is ready??
	async setup() {
		fs.writeFileSync(`${__dirname}/../tmp/cluster-${this.clusterID}.pid`, process.pid.toString());

		function exit() {
			if (fs.existsSync(`${__dirname}/../tmp/cluster-${this.clusterID}.pid`)) try { fs.unlinkSync(`${__dirname}/../tmp/cluster-${this.clusterID}.pid`); } catch (e) { }
			process.kill(process.pid);
		}

		process
			.on("exit", exit.bind(null))
			.on("SIGINT", exit.bind(null))
			.on("SIGUSR1", exit.bind(null))
			.on("SIGUSR2", exit.bind(null));

		this
			.registerEvent("eval", async (d: EvalMessage) => {
				let result, error = false;
				const start = parseFloat(performance.now().toFixed(2));
				try {
					result = await eval(d.msg.code);
				} catch (e) {
					result = {
						message: e.message,
						name: e.name,
						stack: e.stack,
						code: d.msg.code
					};
					error = true;
				}
				const end = parseFloat(performance.now().toFixed(2));

				this.ipc.sendTo(d.msg.clusterId, "evalResponse", {
					result,
					time: {
						start,
						end,
						total: parseFloat((end - start).toFixed(2))
					},
					error,
					clusterId: this.clusterID,
					resId: d.msg.resId
				} as EvalResponseMessage["msg"]);
			})
			.registerEvent("evalResponse", (d: EvalResponseMessage) => {
				if (!this.cb.has(d.msg.resId)) throw new TypeError(`Eval Response CB "${d.msg.resId}" not found.`);
				const { reject, resolve } = this.cb.get(d.msg.resId);

				if (d.msg.error === true) reject(new EvalError(d.msg.result.message, d.msg.result.name, d.msg.result.stack, d.msg.result.code));
				else resolve({
					time: d.msg.time,
					result: d.msg.result
				});
			})
			.registerEvent("reload", (d: ReloadMessage) => {
				const { type, data } = d.msg;
			});

		require(`${__dirname}/events/ready`).default.listener.call(this);

		fs.readdirSync(`${__dirname}/events`).map(d => {
			const e: ClientEvent = require(`${__dirname}/events/${d}`).default;
			if (!e) throw new TypeError(`Event file ${d} is missinfg an export.`);
			if (!e.listener) throw new TypeError(`Event file ${d} is missing a listener.`);
			if (!e.event) throw new TypeError(`Event file ${d} is missing an event.`);
			const b = e.listener.bind(this);
			this.bot.on(e.event, b);
			// this.log("debug", `Loaded the event ${e.event}`, "Event Listener");
		});
	}

	log(level: "log" | "info" | "warn" | "error" | "data" | "debug" | "internal", message: any, name: string) {
		Logger[level](`${name || "General"}`, message);
	}

	async track(...parts: (string | number)[]) {
		await Redis.INCR(`${config.beta ? "beta" : "prod"}:${parts.join(":")}`);
		await DataDog.increment(`bot.${config.beta ? "beta" : "prod"}.${parts.join(".")}`);
	}

	getQueue(guild: Eris.Guild | string, txt: Eris.TextChannel | string, vc: Eris.VoiceChannel | string) {
		if (guild instanceof Eris.Guild) guild = guild.id;
		let q = this.q.get(guild);
		if (!q) q = this.q.set(guild, new MusicQueue(guild, txt, vc, this)).get(guild);
		return q;
	}

	getRecommendedNode() { return this.v; }

	async shutdown(done) {
		this.api.srv.close();
		Logger.log("Shutdown", "Closed API Server.");
		return done();
	}
}
