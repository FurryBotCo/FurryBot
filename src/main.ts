
import Eris from "eris";
import config from "./config";
import Logger from "./util/LoggerV9";
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
import { Cluster } from "lavalink";
import { Collection } from "@augu/immutable";
import MusicQueue from "./util/MusicQueue";

export default class FurryBot extends Eris.Client {
	holder: Holder;
	lvl: HolderV2;
	c: MessageCollector<this>;
	w: WebhookStore<this>;
	m: ModLogUtil;
	cmd: CommandHandler;
	api: API;
	firstReady: boolean;
	v: Cluster;
	q: Collection<MusicQueue>;
	constructor(token: string, clientOptions: Eris.ClientOptions) {
		super(token, clientOptions);
		this.holder = new Holder();
		this.lvl = new HolderV2();
		fs.readdirSync(`${__dirname}/events`).map((d) => {
			const e: ClientEvent = require(`${__dirname}/events/${d}`).default;
			if (!e) throw new TypeError(`Event file ${d} is missing an export.`);
			if (!e.listener) throw new TypeError(`Event file ${d} is missing a listener.`);
			if (!e.event) throw new TypeError(`Event file ${d} is missing an event.`);
			const b = e.listener.bind(this);
			this.on(e.event, b);
			this.holder.set("events", e.event, b);
		});

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

	getRecommendedNode() { return this.v.sort()[0]; }
}
