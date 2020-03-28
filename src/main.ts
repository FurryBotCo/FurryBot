import Eris from "eris";
import Holder from "./util/Holder";
import MessageCollector from "./util/MessageCollector";
import ErrorHandler from "./util/ErrorHandler";
import DeadShardTest from "./util/DeadShardTest";
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
	shardTest: DeadShardTest;
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
	constructor(token: string, options: Eris.ClientOptions) {
		super(token, options);
		this.holder = new Holder();

		fs.readdirSync(`${__dirname}/events`).map((d) => {
			const e: ClientEvent = require(`${__dirname}/events/${d}`).default;
			const b = e.listener.bind(this);
			this.on(e.event, b);
			this.holder.set("events", e.event, b);
		});
		this.col = new MessageCollector(this);
		this.err = new ErrorHandler(this);
		this.shardTest = new DeadShardTest(this);
		this.cmd = new CommandHolder(this);
		this.cd = new CooldownHandler();
		this.cd
			.on("add", (value, type, time, meta) => {
				if (type === "cmd") Logger.debug("Cooldown Handler", `Set cooldown for "${value}" on "${meta.cmd}" for "${time}"`);
			})
			.on("remove", (value, type, time, meta) => {
				if (type === "cmd") Logger.debug("Cooldown Handler", `Removed cooldown for "${value}" on "${meta.cmd}" (time: ${time})`);
			});
		this.temp = null;
		this.w = new WebhookStore(this);
		Object.keys(config.webhooks).map(h => this.w.add(h, config.webhooks[h].id, config.webhooks[h].token));
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

		process
			.on("unhandledRejection", (reason, promise) =>
				this.err.globalHandler.bind(this.err, "unhandledRejection")({ reason, promise })
			)
			.on("uncaughtException", (error) =>
				this.err.globalHandler.bind(this.err, "uncaughtException")({ error })
			);
	}
}
