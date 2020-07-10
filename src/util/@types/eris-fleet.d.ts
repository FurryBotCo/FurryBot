/// <reference types="node" />


declare module "eris-fleet" {
	import { EventEmitter } from "events";
	import Eris from "eris";
	import { Worker } from "cluster";

	export class Collection<K = any, V = any> extends Map<K, V> {
		constructor();
		find(func: Function): any;
	}

	export class IPC extends EventEmitter {
		private events;
		constructor();
		register(event: string, callback: Function): void;
		unregister(event: string): void;
		broadcast(op: string, message?: any): void;
		sendTo(cluster: number, op: string, message?: any): void;
		fetchUser(id: string): Promise<Eris.User>;
		fetchGuild(id: string): Promise<Eris.Guild>;
		fetchChannel<T extends Eris.AnyChannel = Eris.AnyChannel>(id: string): Promise<T>;
		fetchMember(guildID: string, memberID: string): Promise<Eris.Member>;
		command(service: string, message?: any, receptive?: Boolean): Promise<any>;
		getStats(): Promise<Stats>;
		restartCluster(clusterID: number, hard?: Boolean): void;
		restartAllClusters(hard?: Boolean): void;
		restartService(serviceName: string, hard?: Boolean): void;
		restartAllServices(hard?: Boolean): void;
		shutdownCluster(clusterID: number, hard?: Boolean): void;
		shutdownService(serviceName: string, hard?: Boolean): void;
		/** Total shutdown of fleet */
		totalShutdown(hard?: Boolean): void;
	}

	export interface ClusterConnectMessage {
		clusterID: number;
		clusterCount: number;
		op: "connect";
		firstShardID: number;
		lastShardID: number;
		shardCount: number;
		token: string;
		clientOptions: Eris.ClientOptions;
		path: string;
		whatToLog: string[];
	}

	export interface ShutdownMessage {
		op: "shutdown";
		killTimeout: number;
	}

	export interface ServiceConnectMessage {
		serviceName: string;
		path: string;
		op: "connect";
		timeout: number;
		whatToLog: string[];
	}

	export interface QueueItem {
		type: "service" | "cluster";
		workerID: number;
		message: ClusterConnectMessage | ServiceConnectMessage | ShutdownMessage;
	}

	export class Queue extends EventEmitter {
		/** The queue */
		queue: QueueItem[];
		constructor();
		execute(first?: Boolean): void;
		item(item: QueueItem, overrideLocation?: number): void;
	}

	export interface Options {
		/** Absolute path to the js file */
		path: string;
		/** Bot token */
		token: string;
		/** Guilds per shard */
		guildsPerShard?: number;
		/** Number of shards */
		shards?: number | "auto";
		/** Number of clusters */
		clusters?: number | "auto";
		/** Options to pass to the Eris client constructor */
		clientOptions?: Eris.ClientOptions;
		/** How long to wait for shards to connect to discord */
		timeout?: number;
		/** How long to wait for a service to connect */
		serviceTimeout?: number;
		/** How long between starting clusters */
		clusterTimeout?: number;
		/** Node arguments to pass to the clusters */
		nodeArgs?: string[];
		/** How often to update the stats after all clusters are spawned (set to "disable" to disable automated stats) */
		statsInterval?: number | "disable";
		/** Services to start by name and path */
		services?: ServiceCreator[];
		/** First shard ID to use on this instance of eris-fleet */
		firstShardID?: number;
		/** Last shard ID to use on this instance of eris-fleet */
		lastShardID?: number;
		/** Option to have less logging show up */
		lessLogging?: Boolean;
		/** Allows for more logging customization (overrides generic lessLogging option) */
		whatToLog?: any;
		/** Amount of time to wait before doing a forced shutdown during shutdowns */
		killTimeout?: number;
		/** Whether to split the source in to an Object */
		objectlogging?: Boolean;
	}

	export interface ShardStats {
		latency: number;
		id: number;
		ready: Boolean;
		status: "disconnected" | "connecting" | "handshaking" | "ready" | "resuming";
		guilds: number;
		users: number;
	}

	export interface ClusterStats {
		id: number;
		guilds: number;
		users: number;
		uptime: number;
		voice: number;
		largeGuilds: number;
		ram: number;
		shardStats: ShardStats[] | [];
	}

	export interface ServiceStats {
		name: string;
		ram: number;
	}

	export interface ServiceCreator {
		name: string;
		path: string;
	}

	export interface Stats {
		guilds: number;
		users: number;
		clustersRam: number;
		servicesRam: number;
		masterRam: number;
		totalRam: number;
		voice: number;
		largeGuilds: number;
		shardCount: number;
		clusters: ClusterStats[];
		services: ServiceStats[];
	}

	export class Admiral extends EventEmitter {
		/** Map of clusters by  to worker by ID */
		clusters: Collection;
		/** Map of services by name to worker ID */
		services: Collection;
		private path;
		private token;
		guildsPerShard: number;
		shardCount: number | "auto";
		clusterCount: number | "auto";
		lastShardID: number;
		firstShardID: number;
		private clientOptions;
		serviceTimeout: number;
		clusterTimeout: number;
		killTimeout: number;
		private nodeArgs?;
		private statsInterval;
		stats?: Stats;
		/** Services to create */
		private servicesToCreate?;
		private queue;
		private eris;
		private prelimStats?;
		private statsWorkersCounted?;
		private chunks?;
		private statsAlreadyStarted?;
		private whatToLog;
		private softKills;
		private launchingManager;
		private objectlogging;
		constructor(options: Options);
		private launch;
		private startService;
		private startCluster;
		private calculateShards;
		private chunk;
		private shutdownWorker;
		private restartWorker;
		private fetchInfo;
		private startStats;
		private broadcast;
		error(message: any, source?: string): void;
		debug(message: any, source?: string): void;
		log(message: any, source?: string): void;
		warn(message: any, source?: string): void;
	}

	export interface ServiceSetup {
		serviceName: string;
		workerID: number;
	}

	export class BaseServiceWorker {
		workerID: number;
		ipc: IPC;
		serviceName: string;
		/** Function to report a service being ready */
		serviceReady: () => any;
		/** Function to report error during service launch */
		serviceStartingError: (err: any) => any;
		readyPromise: any;
		handleCommand(d: any): Promise<any>;
		/** Function called for graceful shutdown of the service */
		shutdown?(done: () => any): Promise<void>;
		constructor(setup: ServiceSetup);
	}

	export class Service {
		path: string;
		serviceName: string;
		app: BaseServiceWorker;
		timeout: number;
		whatToLog: string[];
		constructor();
		private loadCode;
	}

	export interface ClusterSetup {
		bot: Eris.Client;
		clusterID: number;
		workerID: number;
	}

	export class BaseClusterWorker {
		bot: Eris.Client;
		clusterID: number;
		workerID: number;
		ipc: IPC;
		/** Function called for graceful shutdown of the cluster */
		shutdown(done: () => any): Promise<void>;
		constructor(setup: ClusterSetup);
	}

	export class Cluster {
		firstShardID: number;
		lastShardID: number;
		path: string;
		clusterID: number;
		clusterCount: number;
		shardCount: number;
		shards: number;
		clientOptions: any;
		whatToLog: string[];
		bot: Eris.Client;
		private token;
		app: BaseClusterWorker;
		shutdown?: Boolean;
		constructor();
		private connect;
		private loadCode;
	}

	export { Admiral as Fleet };
}
