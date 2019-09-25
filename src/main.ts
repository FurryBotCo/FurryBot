import * as Eris from "eris";
import * as fs from "fs-extra";
import config from "./config";
import Logger from "./util/LoggerV7";
// import cat from "./commands";
// import resp from "./responses";
// import Command from "./modules/cmd/Command";
// import AutoResponse from "./modules/cmd/AutoResponse";
// import Category from "./modules/cmd/Category";
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

class FurryBot extends Eris.Client {
	logger: Logger;
	// autoResponses: AutoResponse[];
	// commands: Command[];
	// categories: Category[];
	// commandTriggers: string[];
	// autoResponseTriggers: string[];
	/*commandTimeout: {
		[key: string]: Set<string>
	};*/
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
	constructor(token: string, options: Eris.ClientOptions) {
		super(token, options);
		this.logger = new Logger();

		this.f = { ...functions, ErrorHandler };

		fs.readdirSync(`${__dirname}/handlers/events/client`).map(d => {
			const e: ClientEvent = require(`${__dirname}/handlers/events/client/${d}`).default;
			this.on(e.event, e.listener.bind(this));
		});

		this.spamCounter = [];
		this.responseSpamCounter = [];

		this.yiffNoticeViewed = new Set();

		this.ucwords = functions.ucwords;

		this.MessageCollector = new MessageCollector(this);

		this.tclient = new Trello(config.apis.trello.apiKey, config.apis.trello.apiToken);

		global.console.log = (async (msg: string | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> => this.logger._log("log", msg, shardId, extra));
		global.console.info = (async (msg: string | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> => this.logger._log("info", msg, shardId, extra));
		global.console.debug = (async (msg: string | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> => this.logger._log("debug", msg, shardId, extra));
		global.console.warn = (async (msg: string | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> => this.logger._log("warn", msg, shardId, extra));
		global.console.error = (async (msg: string | any[] | object | Buffer | Promise<any>, shardId?: number, extra?: string | string[]): Promise<boolean> => this.logger._log("error", msg, shardId, extra));

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

export default FurryBot;