import * as Eris from "eris";
import * as fs from "fs-extra";
import config from "./config";
import Functions from "./util/functions";
import { MessageCollector, ClientEvent, Temp, ExtendedMessage } from "bot-stuff";
import { BaseClient, Cluster, Logger } from "clustersv2";
// import { Logger } from "clustersv2";
import Trello from "trello";
import E6API from "e6api";
import E9API from "e9api";
import FurryBotAPI from "furrybotapi";
import UserConfig from "./modules/config/UserConfig";
import GuildConfig from "./modules/config/GuildConfig";
import Analytics from "./util/Analytics";

export default class FurryBot extends BaseClient {
	srv: any;
	ls: any;
	Temp: Temp; // tslint:disable-line: variable-name
	MessageCollector: MessageCollector<FurryBot, ExtendedMessage<FurryBot, UserConfig, GuildConfig>>; // tslint:disable-line: variable-name
	yiffNoticeViewed: Set<string>;
	tclient: Trello;
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
	fb: FurryBotAPI;
	f: Functions;
	activeReactChannels: string[];
	a: Analytics;
	intr: NodeJS.Timeout;
	constructor(cluster: Cluster) {
		super(cluster);
		this.intr = null;
	}

	async launch(cluster: Cluster) {
		Logger.log(`Cluster #${cluster.id}`, `Launched as ${this.client.user.username}#${this.bot.user.discriminator}`);

		this.f = new Functions(this);
		fs.readdirSync(`${__dirname}/handlers/events/client`).map(d => {
			const e: ClientEvent<FurryBot> = require(`${__dirname}/handlers/events/client/${d}`).default;
			this.bot.on(e.event, e.listener.bind(this));
		});

		this.spamCounter = [];
		this.responseSpamCounter = [];
		this.activeReactChannels = [];
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
		this.a = new Analytics(config.universalKey, "bots", config.beta ? "furrybotbeta" : "furrybot", config.web.userAgent);
	}
}
