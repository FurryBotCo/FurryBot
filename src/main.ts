import * as Eris from "eris";
import * as fs from "fs-extra";
import config from "./config";
import MessageCollector from "./util/MessageCollector";
import Temp from "./util/Temp";
import E6API from "e6api";
import E9API from "e9api";
import { StatsD } from "node-statsd";
import ErrorHandler from "./util/ErrorHandler";
import ClientEvent from "./util/ClientEvent";
import CommandHolder from "./util/CommandHandler/lib/CommandHolder";
import DeadShardTest from "./util/DeadShardTest";
import WebhookStore from "./util/WebhookStore";
import { ModLogHolder } from "./util/ModLogHandler";
import CooldownHandler from "./util/CooldownHandler";
import Logger from "./util/LoggerV8";

export default class FurryBot extends Eris.Client {
	srv: any;
	ls: any;
	temp: Temp;
	messageCollector: MessageCollector;
	yiffNoticeViewed: Set<string>;
	spamCounter: {
		time: number;
		user: string;
		cmd: string;
	}[];
	spamCounterInterval: NodeJS.Timeout;
	responseSpamCounter: {
		time: number;
		user: string;
		response: string;
	}[];
	e6: E6API;
	e9: E9API;
	activeReactChannels: string[];
	// a: Analytics;
	intr: NodeJS.Timeout;
	errorHandler: ErrorHandler;
	ddog: StatsD;
	cmd: CommandHolder;
	firstReady: boolean;
	cd: CooldownHandler;
	channelTyping: Map<string, NodeJS.Timeout>;
	_autoyiffLoop: NodeJS.Timeout;
	_timedLoop: NodeJS.Timeout;
	shardTest: DeadShardTest;
	w: WebhookStore;
	m: ModLogHolder;
	constructor(token: string, options: Eris.ClientOptions) {
		super(token, options);
		fs.readdirSync(`${__dirname}/events`).map((d) => {
			const e: ClientEvent = require(`${__dirname}/events/${d}`).default;
			this.on(e.event, e.listener.bind(this));
		});

		this.intr = null;

		this._autoyiffLoop = null;
		this.spamCounter = [];
		this.responseSpamCounter = [];
		this.activeReactChannels = [];
		this.yiffNoticeViewed = new Set();
		this.e6 = new E6API({
			userAgent: config.web.userAgentExt("Donovan_DMC, https://github.com/FurryBotCo/FurryBot")
		});
		this.e9 = new E9API({
			userAgent: config.web.userAgentExt("Donovan_DMC, https://github.com/FurryBotCo/FurryBot")
		});
		this.errorHandler = new ErrorHandler(this);
		this.ddog = new StatsD(config.apis.ddog);
		this.cmd = new CommandHolder(this);
		this.channelTyping = new Map();
		this.firstReady = false;
		this.shardTest = new DeadShardTest(this);

		process
			.on("unhandledRejection", (reason, promise) =>
				this.errorHandler.globalHandler.bind(this.errorHandler, "unhandledRejection")({ reason, promise })
			)
			.on("uncaughtException", (error) =>
				this.errorHandler.globalHandler.bind(this.errorHandler, "uncaughtException")({ error })
			);
		this.messageCollector = new MessageCollector(this);
		this.cd = new CooldownHandler();

		this.cd
			.on("add", (value, type, time, meta) => {
				if (type === "cmd") {
					Logger.debug("Cooldown Handler", `Set cooldown for "${value}" on "${meta.cmd}" for "${time}"`);
				}
			})
			.on("remove", (value, type, time, meta) => {
				if (type === "cmd") {
					Logger.debug("Cooldown Handler", `Removed cooldown for "${value}" on "${meta.cmd}" (time: ${time})`);
				}
			});
		const w = this.w = new WebhookStore(this);
		Object.keys(config.webhooks).map(h => w.add(h, config.webhooks[h].id, config.webhooks[h].token));

		this.m = new ModLogHolder(this);
	}

	async increment(stat: string | string[], tags?: string[]): Promise<string> {
		return new Promise((a, b) => !this || !this.ddog ? null : this.ddog.increment(stat, 1, 1, tags, (err, v) => err ? b(err) : a(v.toString())));
	}

	async decrement(stat: string | string[], tags?: string[]): Promise<string> {
		return new Promise((a, b) => !this || !this.ddog ? null : this.ddog.decrement(stat, 1, 1, tags, (err, v) => err ? b(err) : a(v.toString())));
	}
}
