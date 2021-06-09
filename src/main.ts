import config from "./config";
import IPCCommandHandler from "./util/handler/IPCCommandHandler";
import BadgeHandler from "./util/handler/BadgeHandler";
import StatsHandler from "./util/handler/StatsHandler";
import UserConfig from "./db/Models/UserConfig";
import GuildConfig from "./db/Models/GuildConfig";
import ModLogServiceTypes from "./util/@types/ModLogServiceTypes";
import db from "./db";
import { Category, ClientEvent, Command, CommandHandler,  MessageCollector, WebhookStore } from "core";
import { ModuleImport, Utility } from "utilities";
import { CommandHelper } from "slash-extras";
import * as fs from "fs-extra";
import Logger from "logger";
import Eris from "eris";
import { BaseCluster, BaseClusterInitializer } from "clustering";
import { performance } from "perf_hooks";
import path from "path";

export type VALID_LANGUAGES = typeof config["languages"][number];
export default class FurryBot extends BaseCluster {
	cmd: CommandHandler<this, UserConfig, GuildConfig>;
	h = new CommandHelper(config.client.token, config.client.id);
	events = new Map<string, {
		handler: (...args: Array<unknown>) => void;
		event: ClientEvent<FurryBot>;
	}>();
	// this is stored here to avoid making the info command take at least 1 second on each run
	// will this make it inaccurate? Well yes, of course, but it makes the command not sit there stalling,
	// waiting for the test to finish
	cpuUsage = -1;
	firstReady = false;
	w: WebhookStore<this, keyof typeof config["webhooks"]>;
	col: MessageCollector<this>;
	ic: IPCCommandHandler;
	b: BadgeHandler;
	sh: StatsHandler;
	blPosted = false;
	blStats: NodeJS.Timeout;
	private cpuUsageT: NodeJS.Timeout;
	constructor(setup: BaseClusterInitializer) {
		super(setup);
		void db.setClient(this).init(true, true);
		this.cmd = new CommandHandler();
		this.w = new WebhookStore(this).addBulk(config.webhooks);
		/* void this.executeLaunchHook(); */
		this.ic = new IPCCommandHandler(this).register();
		this.b = new BadgeHandler(this);
		this.sh = new StatsHandler(this);
		this.cpuUsageT = setInterval(async() =>  Utility.getCPUUsage().then(v => this.cpuUsage = v), 5e3);
	}

	async launch() {
		this.col = new MessageCollector(this);
		void this.loadEvents(false).then(() => this.events.get("ready")!.handler());
		this.blStats = setInterval(() => {
			const d = new Date();
			if ((d.getMinutes() % 15) === 0) {
				if (this.blPosted === true) return;
				this.blPosted = true;
				Logger.info("Bot List Stats", "Stats updated.");
			} else this.blPosted = false;
		}, 1e3);
	}

	shutdown(done: () => void) {
		this.client.removeAllListeners();
		clearInterval(this.cpuUsageT);
		this.trackNoResponse(
			this.sh.joinParts("stats", "shutdown")
		);
		return done();
	}

	async loadEvents(removeAll: boolean) {
		const start = performance.now();
		if (removeAll) {
			this.client.removeAllListeners();
			Logger.debug([`Cluster #${this.clusterId}`, "Event Loader"], "Removed all listeners before loading events.");
		}
		const events = fs.readdirSync(`${__dirname}/events`);

		for (const event of events) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const { default: e } = await import(`${__dirname}/events/${event}`) as ModuleImport<ClientEvent<this>>;
			if (e instanceof ClientEvent) {
				if (this.events.has(e.event)) this.client.off(e.event, this.events.get(e.event)!.handler);
				const handler = (...d: Array<unknown>) => e.handle(this, ...d) as void;
				this.events.set(e.event, {
					handler,
					event: e as ClientEvent<this>
				});
				this.client.on(e.event, handler);
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
			let cat: Command<this, UserConfig, GuildConfig>;
			try {
				const v = await import(`${__dirname}/commands/${f}/index.${__filename.split(".").slice(-1)[0]}`) as ModuleImport<typeof cat> | typeof cat;
				cat = "default" in v ? v.default : v;
			} catch (e) {
				console.error(e);
			}
			if (cat! instanceof Category) this.cmd.addCategory(cat);
			else throw new TypeError(`Missing or Invalid index in category "${f}" (${path.resolve(`${__dirname}/commands/${f}`)})`);
		}
		const end = performance.now();

		Logger.debug([`Cluster #${this.clusterId}`, "Command Handler"], `Finished loading ${this.cmd.commands.length} commands in ${(end - start).toFixed(3)}ms.`);
	}

	async getUser(id: string) {
		if (this.client.users.has(id)) return this.client.users.get(id)!;
		const user = await this.client.getRESTUser(id).catch(() => null);
		if (user !== null) {
			this.client.users.set(id, user);
			return user;
		}
		return null;
	}

	async getGuild(id: string) {
		if (this.client.guilds.has(id)) return this.client.guilds.get(id)!;
		const guild: Eris.Guild | null = await this.client.getRESTGuild(id).catch(() => null);
		return guild || null;
	}

	async track(...data: Array<string>) {
		return this.ipc.serviceCommand("stats", data, true);
	}

	trackNoResponse(...data: Array<string>) {
		void this.ipc.serviceCommand("stats", data, false);
	}

	async executeModCommand<K extends keyof ModLogServiceTypes.Commands.CommandMap>(type: K, data: Omit<ModLogServiceTypes.Commands.CommandMap[K], "type">) {
		return this.ipc.serviceCommand("mod", {
			type,
			...data
		}, true);
	}
}
