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
import io from "socket.io";
import Analytics from "analytics-node";
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
	io: io.Server;
	a: Analytics;
	constructor(token: string, options: Eris.ClientOptions) {
		super(token, options);
		this.logger = new Logger();

		this.f = { ...functions, ErrorHandler };

		this.a = new Analytics(config.apis.segment.writeKey);

		this.track("client", "client.setup", {
			hostname: this.f.os.hostname(),
			beta: config.beta,
			clientId: config.bot.clientID
		}, new Date());

		fs.readdirSync(`${__dirname}/handlers/events/client`).map(d => {
			const e: ClientEvent = require(`${__dirname}/handlers/events/client/${d}`).default;
			this.track("client", "client.eventHandler.load", {
				hostname: this.f.os.hostname(),
				beta: config.beta,
				clientId: config.bot.clientID,
				handler: {
					event: e.event,
					file: `${__dirname}/handlers/events/client/${d}`
				}
			}, new Date());
			this.on(e.event, e.listener.bind(this));
		});

		// this.commands = cat.map(c => c.commands).reduce((a, b) => a.concat(b));
		// this.categories = cat;
		// this.commandTriggers = cat.map(c => c.commands).reduce((a, b) => a.concat(b)).map(c => c.triggers).reduce((a, b) => a.concat(b));
		// this.autoResponses = resp;
		// this.autoResponseTriggers = this.autoResponses.map(r => r.triggers).reduce((a, b) => a.concat(b));

		// this.commandTimeout = {};
		this.spamCounter = [];
		this.responseSpamCounter = [];

		/* this.commands.map(c => {
			this.commandTimeout[c.triggers[0]] = new Set();
			// this.spamCounter[c.triggers[0]] = [];
		});*/
		// this.autoResponses.map(r => this.commandTimeout[r.triggers[0]] = new Set());
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

		// this.setupCommandHandler.call(this);
	}

	async track(userId, event, properties, timestamp = new Date()) {
		return new Promise((a, b) => {
			return this.a.track({
				userId,
				event,
				properties,
				timestamp
			}, (e, d) => e ? b(e) : a(d));
		});
	}
	/*getCommand(cmd: string | string[]): {
		command: Command[];
		category: Category;
	} {
		if (!cmd) return null;
		if (!(cmd instanceof Array)) {
			cmd = [cmd];
		}

		const command: Command[] = [];

		function walkCmd(c: string[], ct?: Command): any {
			let b: Command;
			const d = c[0];
			if (!ct) b = this.commands.find(cc => cc.triggers.includes(d));
			else if (ct && typeof ct.subCommands !== "undefined") b = ct.subCommands.find(cc => cc.triggers.includes(d));
			else b = null;
			if (!b) return null;
			c.shift();
			if (c.length > 0 && b.hasSubCommands) {
				command.push(b);
				return walkCmd(c, b);
			} else {
				command.push(b);
				return command;
			}
		}

		// console.log(cmd);
		walkCmd.call(this, [...cmd]);
		// console.log(command);
		// if (!this.commandTriggers.includes(cmd)) return null;
		// let command = this.commands.find(c => c.triggers.includes(cmd));
		const category = this.getCategoryFromCommand(cmd[0]);
		return {
			command,
			category
		};
	}

	getCategory(cat: string): Category {
		cat = cat.toLowerCase();
		if (!this.categories.map(c => c.name.toLowerCase()).includes(cat)) return null;
		return this.categories.find(c => c.name.toLowerCase() === cat);
	}

	getCategoryFromCommand(cmd: string): Category {
		if (!cmd) return null;
		cmd = cmd.toLowerCase();
		if (!this.commandTriggers.includes(cmd.toLowerCase())) return null;
		const command = this.commands.find(c => c.triggers.includes(cmd.toLowerCase()));
		return this.getCategory(command.category.name);
	}

	getResponse(resp: string): AutoResponse {
		if (!resp || !this.autoResponseTriggers.includes(resp.toLowerCase())) return null;

		const j = this.autoResponses.find(r => r.triggers.includes(resp.toLowerCase()));

		if (!j) return null;
		return j;
	}*/

	setupCommandHandler() {
		this.cmdHandler
			.addCategory({
				name: "animals",
				displayName: ":dog: Animals",
				devOnly: false,
				description: "Cute little animals to brighten your day!"
			})
			.addCategory({
				name: "developer",
				displayName: ":tools: Developer",
				devOnly: false,
				description: "Commands to make development easier."
			})
			.addCategory({
				name: "economy",
				displayName: ":moneybag: Economy",
				devOnly: false,
				description: "Our economy system."
			})
			.addCategory({
				name: "fun",
				displayName: ":smile: Fun",
				devOnly: false,
				description: "Some commands to spice up your chat."
			})
			.addCategory({
				name: "information",
				displayName: ":tools: Information",
				devOnly: false,
				description: "Some information that may be useful to you, may not be. I don't know."
			})
			.addCategory({
				name: "meme",
				displayName: ":joy: Memey",
				devOnly: false,
				description: "Let's get this bread."
			})
			.addCategory({
				name: "misc",
				displayName: ":thumbsup: Miscellaneous",
				devOnly: false,
				description: "Miscellaneous stuff."
			})
			.addCategory({
				name: "moderation",
				displayName: ":hammer: Moderation",
				devOnly: false,
				description: "Stomp down the server baddies with your ban hammer."
			})
			.addCategory({
				name: "music",
				displayName: ":musical_note: Music",
				devOnly: false,
				description: "Free music right inside your Discord!"
			})
			.addCategory({
				name: "nsfw",
				displayName: ":smirk: NSFW",
				devOnly: false,
				description: "That stuff your parents warned you about >~>"
			})
			.addCategory({
				name: "utility",
				displayName: ":tools: Utility",
				devOnly: false,
				description: "Helpful things for the bot, and your server."
			});

	}
}

export default FurryBot;