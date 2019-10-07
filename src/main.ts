import * as Eris from "eris";
import * as fs from "fs-extra";
import config from "./config";
import Functions from "./util/functions";
import Temp from "./util/Temp";
import MessageCollector from "./util/MessageCollector";
import Trello from "trello";
import E6API from "e6api";
import E9API from "e9api";
import FurryBotAPI from "furrybotapi";
import ClientEvent from "./modules/ClientEvent";
import { BaseClient, Logger, T } from "@donovan_dmc/ws-clusters";

export default class FurryBot extends BaseClient {
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
	f: Functions;
	activeReactChannels: string[];
	constructor(cluster: T.Cluster) {
		super(cluster);
	}

	async launch(cluster: T.Cluster) {
		Logger.log(`Cluster #${cluster.id}`, `Launched as ${this.bot.user.username}#${this.bot.user.discriminator}`);

		this.f = new Functions(this);
		fs.readdirSync(`${__dirname}/handlers/events/client`).map(d => {
			const e: ClientEvent = require(`${__dirname}/handlers/events/client/${d}`).default;
			this.bot.on(e.event, e.listener.bind(this));
		});

		this.spamCounter = [];
		this.responseSpamCounter = [];

		this.yiffNoticeViewed = new Set();

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
	}
}
