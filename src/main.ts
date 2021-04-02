import config from "./config";
import db from "./db";
import IPCCommandHandler from "./util/handler/IPCCommandHandler";
import BadgeHandler from "./util/handler/BadgeHandler";
import StatsHandler from "./util/handler/StatsHandler";
import UserConfig from "./db/Models/UserConfig";
import GuildConfig from "./db/Models/GuildConfig";
import { BaseClusterWorker, BaseClusterWorkerSetup } from "eris-fleet";
import { Category, ClientEvent, Command, CommandHandler,  MessageCollector, WebhookStore } from "core";
import { ModuleImport, Utility } from "utilities";
import { CommandHelper } from "slash-commands";
import * as fs from "fs-extra";
import Logger from "logger";
import Eris from "eris";
import { performance } from "perf_hooks";
import path from "path";

export type VALID_LANGUAGES = typeof config["languages"][number];
export default class FurryBot extends BaseClusterWorker {
	cmd: CommandHandler<this, UserConfig, GuildConfig>;
	w: WebhookStore<this, keyof typeof config["webhooks"]>;
	col: MessageCollector<this>;
	events = new Map<string, {
		handler: (...args: Array<unknown>) => void;
		event: ClientEvent<FurryBot>;
	}>();
	h: CommandHelper;
	ic: IPCCommandHandler;
	b: BadgeHandler;
	sh: StatsHandler;
	// this is stored here to avoid making the info command take at least 1 second on each run
	// will this make it inaccurate? Well yes, of course, but it makes the command not sit there stalling,
	// waiting for the test to finish
	cpuUsage = -1;
	firstReady = false;
	private cpuUsageT: NodeJS.Timeout;
	constructor(setup: BaseClusterWorkerSetup) {
		super(setup);
		this.cmd = new CommandHandler();
		this.w = new WebhookStore(this);
		this.w.addBulk(config.webhooks);
		/* void this.executeLaunchHook(); */
		this.col = new MessageCollector(this);
		this.h = new CommandHelper(config.client.token, config.client.id);
		this.ic = new IPCCommandHandler(this).register();
		this.b = new BadgeHandler(this);
		this.sh = new StatsHandler(this);
		db.setClient(this);
		void this.loadEvents(false);
		this.cpuUsageT = setInterval(async() =>  Utility.getCPUUsage().then(v => this.cpuUsage = v), 5e3);
	}

	async launch() {
		// @TODO
	}

	override shutdown(done: () => void) {
		this.bot.removeAllListeners();
		clearInterval(this.cpuUsageT);
		this.trackNoResponse(
			this.sh.joinParts("stats", "shutdown")
		);
		return done();
	}

	async loadEvents(removeAll: boolean) {
		const start = performance.now();
		if (removeAll) {
			this.bot.removeAllListeners();
			Logger.debug([`Cluster #${this.clusterId}`, "Event Loader"], "Removed all listeners before loading events.");
		}
		const events = fs.readdirSync(`${__dirname}/events`);

		for (const event of events) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const { default: e } = await import(`${__dirname}/events/${event}`) as ModuleImport<ClientEvent<this>>;
			if (e instanceof ClientEvent) {
				if (this.events.has(e.event)) this.bot.off(e.event, this.events.get(e.event)!.handler);
				const handler = (...d: Array<unknown>) => e.handle(this, ...d) as void;
				this.events.set(e.event, {
					handler,
					event: e as ClientEvent<this>
				});
				this.bot.on(e.event, handler);
				Logger.debug([`Cluster #${this.clusterId}`, "Event Loader"], `Loaded the event "${e.event}".`);
			} else {
				Logger.error([`Cluster #${this.clusterId}`, "Event Loader"], `Error loading the event file "${event}", export is not an instance of ClientEvent.`);
				continue;
			}
		}
		const end = performance.now();

		Logger.debug([`Cluster #${this.clusterId}`, "Event Loader"], `Finished loading ${events.length} events in ${(end - start).toFixed(3)}ms.`);
	}

	async loadCommands(dir: string, skip?: string | Array<string>) {
		if (!skip) skip = [];
		if (!Array.isArray(skip)) skip = [skip];
		const start = performance.now();
		Logger.debug([`Cluster #${this.clusterId}`, "Command Handler"], "Loading commands.");
		const c = fs.readdirSync(dir);
		for (const f of c) {
			if (skip.includes(f.toLowerCase())) {
				Logger.warn([`Cluster #${this.clusterId}`, "Command Handler"], `Skipping category "${f}" (${dir}/${f})`);
				continue;
			}
			let cat;
			try {
				cat = await import(`${__dirname}/commands/${f}/index.${__filename.split(".").slice(-1)[0]}`) as ModuleImport<Command<this, UserConfig, GuildConfig>>;
				if (cat.default) cat = cat.default;
			} catch (e) {
				console.error(e);
			}
			if (cat instanceof Category) this.cmd.addCategory(cat);
			else throw new TypeError(`Missing or Invalid index in category "${f}" (${path.resolve(`${__dirname}/commands/${f}`)})`);
		}
		const end = performance.now();

		Logger.debug([`Cluster #${this.clusterId}`, "Command Handler"], `Finished loading ${this.cmd.commands.length} commands in ${(end - start).toFixed(3)}ms.`);
	}

	async getUser(id: string) {
		if (this.bot.users.has(id)) return this.bot.users.get(id)!;
		let user = await this.ipc.fetchUser(id);
		if (user !== null) {
			this.bot.users.set(id, user);
			return user;
		} else {
			user = await this.bot.getRESTUser(id).catch(() => null);
			if (user !== null) {
				this.bot.users.set(id, user);
				return user;
			}
		}
		return null;
	}

	async getGuild(id: string) {
		if (this.bot.guilds.has(id)) return this.bot.guilds.get(id)!;
		const g = await this.ipc.fetchGuild(id);
		if (g !== null) return g;
		const guild: Eris.Guild | null = await this.bot.getRESTGuild(id).catch(() => null);
		return guild || null;
	}

	async track(...data: Array<string>) {
		return this.ipc.command("stats", data, true);
	}

	trackNoResponse(...data: Array<string>) {
		void this.ipc.command("stats", data, false);
	}
}
