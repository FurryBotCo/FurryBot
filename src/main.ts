/// <reference path="./util/@types/eris-fleet.d.ts" />
import { Worker } from "worker_threads";
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

const ew = process.emitWarning;
process.emitWarning = ((w, name, code) => {
	if (w.toString().indexOf("NODE_TLS_REJECT_UNAUTHORIZED") !== -1) return;
	else return ew(w, name, code);
});


interface EvalMessage {
	op: "eval";
	msg: {
		code: string;
		clusterId: number;
		resId: string;
	};
}

interface EvalResponseMessage {
	op: "evalResponse";
	msg: {
		result: string;
		time: {
			start: number;
			end: number;
			total: number;
		};
		clusterId: number;
		resId: string;
	} & ({
		result: {
			message: string;
			name: string;
			stack: string;
		};
		error: true;
	} | {
		result: string;
		error: false;
	});
}

class EvalError extends Error {
	constructor(message: string, name: string, stack: string) {
		super(message);
		this.name = name;
		this.stack = stack;
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

	async evalAtCluster(id: number, code: string): Promise<{
		time: {
			start: number;
			end: number;
			total: number;
		};
		result: string;
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
		});
	}

	async broadcastEval(code: string): Promise<ThenArg<ReturnType<this["evalAtCluster"]>>[]> {
		const count = Number(config.client.options.clusters) || 1;
		const clusters = [];
		for (let i = 0; i < count; i++) clusters.push(i);

		return Promise.all(clusters.map(c => this.evalAtCluster(c, code))) as any;
	}

	// because they don't construct this until the cluster is ready??
	async setup() {
		this.ipc.register("eval", async (d: EvalMessage) => {
			let result, error = false;
			const start = parseFloat(performance.now().toFixed(2));
			try {
				result = await eval(d.msg.code);
			} catch (e) {
				result = {
					message: e.message,
					name: e.name,
					stack: e.stack
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
		});
		this.ipc.register("evalResponse", (d: EvalResponseMessage) => {
			if (!this.cb.has(d.msg.resId)) throw new TypeError(`Eval Response CB "${d.msg.resId}" not found.`);
			const { reject, resolve } = this.cb.get(d.msg.resId);

			if (d.msg.error === true) reject(new EvalError(d.msg.result.message, d.msg.result.name, d.msg.result.stack));
			else resolve({
				time: d.msg.time,
				result: d.msg.result
			});
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
		return done();
	}
}
