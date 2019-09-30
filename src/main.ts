import * as Eris from "eris";
import * as fs from "fs-extra";
import config from "./config";
import functions, { ErrorHandler } from "./util/functions";
import Temp from "./util/Temp";
import MessageCollector from "./util/MessageCollector";
import Trello from "trello";
import E6API from "e6api";
import E9API from "e9api";
import FurryBotAPI from "furrybotapi";
import { CommandHandler } from "./util/CommandHandler";
import WebSocket from "ws";
import ClientEvent from "modules/ClientEvent";
import { BaseClient, Cluster, Logger, LoggerV8 } from "@donovan_dmc/ws-clusters";

export default class FurryBot extends BaseClient {
	cluster: Cluster;
	ucwords: (str: string) => string;
	srv: any;
	ls: any;
	Temp: Temp; // tslint:disable-line: variable-name
	MessageCollector: MessageCollector; // tslint:disable-line: variable-name
	yiffNoticeViewed: Set<string>;
	tclient: Trello;
	spamCounter: {
		time: number;
		user: string;
		cmd: string;
	}[];
	responseSpamCounter: {
		time: number;
		user: string;
		response: string;
	}[];
	spamCounterInterval: NodeJS.Timeout;
	e6: E6API;
	e9: E9API;
	fb: FurryBotAPI;
	f: typeof import("./util/functions").default & { ErrorHandler: typeof import("./util/functions").ErrorHandler };
	activeReactChannels: string[];
	cmdHandler: CommandHandler;
	wss: WebSocket.Server;
	constructor(cluster: Cluster) {
		super(cluster);
	}

	async launch(cluster: Cluster) {
		Logger.log(`Cluster #${cluster.clusterId}`, `Launched as ${this.bot.user.username}#${this.bot.user.discriminator}`);

		this.f = { ...functions, ErrorHandler };

		fs.readdirSync(`${__dirname}/handlers/events/client`).map(d => {
			const e: ClientEvent = require(`${__dirname}/handlers/events/client/${d}`).default;
			this.bot.on(e.event, e.listener.bind(this));
		});

		this.spamCounter = [];
		this.responseSpamCounter = [];

		this.yiffNoticeViewed = new Set();

		this.ucwords = functions.ucwords;

		this.MessageCollector = new MessageCollector(this);

		this.tclient = new Trello(config.apis.trello.apiKey, config.apis.trello.apiToken);

		this.e6 = new E6API({
			userAgent: config.web.userAgentExt("Donovan_DMC, https://github.com/FurryBotCo/FurryBot")
		});

		this.e9 = new E9API({
			userAgent: config.web.userAgentExt("Donovan_DMC, https://github.com/FurryBotCo/FurryBot")
		});

		this.fb = new FurryBotAPI(config.web.userAgent);

		this.activeReactChannels = [];

		this.cmdHandler = new CommandHandler(this, {
			alwaysAddSend: true
		});
	}
}
