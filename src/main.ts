import Eris from "eris";
import { Base, Cluster } from "clustersv3";
import Holder from "./util/Holder";
import MessageCollector from "./util/MessageCollector";
import ErrorHandler from "./util/ErrorHandler";
import CommandHolder from "./util/CommandHandler/lib/CommandHolder";
import WebhookStore from "./util/WebhookStore";
import config from "./config";
import CooldownHandler from "./util/CooldownHandler";
import Logger from "./util/LoggerV8";
import Temp from "./util/Temp";
import ClientEvent from "./util/ClientEvent";
import * as fs from "fs-extra";
import E6API from "e6api";
import E9API from "e9api";
import ModLogUtil from "./util/ModLogUtil";
import * as http from "http";
import * as https from "https";

export default class FurryBot extends Eris.Client {
	holder: Holder;
	col: MessageCollector;
	err: ErrorHandler;
	cmd: CommandHolder;
	cd: CooldownHandler;
	temp: Temp;
	w: WebhookStore;
	m: ModLogUtil;
	firstReady: boolean;
	spamCounter: {
		command: {
			time: number;
			user: string;
			cmd: string;
		}[];
		interval: NodeJS.Timeout;
		response: {
			time: number;
			user: string;
			response: string;
		}[];
	};
	e6: E6API;
	e9: E9API;
	srv: http.Server | https.Server;
	constructor(token, clientOptions) {
		super(token, clientOptions);

		this.holder = new Holder();
		fs.readdirSync(`${__dirname}/events`).map((d) => {
			const e: ClientEvent = require(`${__dirname}/events/${d}`).default;
			if (!e) throw new TypeError(`Event file ${d} is missing an export.`);
			if (!e.listener) throw new TypeError(`Event file ${d} is missing a listener.`);
			if (!e.event) throw new TypeError(`Event file ${d} is missing an event.`);
			const b = e.listener.bind(this);
			this.on(e.event, b);
			this.holder.set("events", e.event, b);
		});
		this.col = new MessageCollector(this);
		this.err = new ErrorHandler(this);
		this.cmd = new CommandHolder(this);
		this.cd = new CooldownHandler();
		this.cd
			.on("add", (value, type, time, meta) => {
				if (type === "cmd") this.log("debug", `Set cooldown for "${value}" on "${meta.cmd}" for "${time}"`, "Cooldown Handler");
			})
			.on("remove", (value, type, time, meta) => {
				if (type === "cmd") this.log("debug", `Removed cooldown for "${value}" on "${meta.cmd}" (time: ${time})`, "Cooldown Handler");
			});
		this.temp = null;
		this.w = new WebhookStore(this);
		Object.keys(config.webhooks).map(h => this.w.add(h, config.webhooks[h].id, config.webhooks[h].token, config.webhooks[h].username, config.webhooks[h].avatar));
		this.m = new ModLogUtil(this);
		this.firstReady = false;
		this.spamCounter = {
			command: [],
			interval: null,
			response: []
		};
		this.e6 = new E6API({
			userAgent: config.web.userAgentExt("Donovan_DMC, https://github.com/FurryBotCo/FurryBot")
		});
		this.e9 = new E9API({
			userAgent: config.web.userAgentExt("Donovan_DMC, https://github.com/FurryBotCo/FurryBot")
		});
	}

	log(level: "log" | "info" | "warn" | "error" | "data" | "debug" | "internal" | "internal.debug", message: any, name: string) {
		Logger[level](`${name || "General"}`, message);
	}
}
