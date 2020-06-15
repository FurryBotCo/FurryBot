declare module "eris-sharder" {
	import { EventEmitter } from "tsee";
	import * as Eris from "eris";
	import { ChildProcess } from "child_process";

	export interface MasterOptions {
		stats?: boolean;
		webhooks?: {
			[k in "shard" | "cluster"]?: {
				id: string;
				token: string
			};
		};
		clientOptions?: Eris.ClientOptions;
		clusters?: number;
		clusterTimeout?: number;
		shard?: number;
		firstShardID?: number;
		lastShardID?: number;
		debug?: boolean;
		statsInterval?: number;
		name?: string;
		guildsPerShard?: number;
	}

	export interface Stats {
		guilds: number;
		users: number;
		totalRam: number;
		voice: number;
		exclusiveGuilds: number;
		largeGuilds: number;
		clusters: ClusterStats[];
	}

	export interface MasterStats {
		stats: Stats;
		clustersCounted: number;
	}

	export interface ClusterStats {
		cluster: number;
		shards: number;
		guilds: number;
		ram: number;
		voice: number;
		uptime: number;
		largeGuilds: number;
		shardStats: ShardStats[];
	}

	export interface ShardStats {
		id: number;
		ready: boolean;
		latency: boolean;
		status: Eris.Shard["status"];
	}

	class ClusterManager extends EventEmitter<{
		stats: (stats: Stats) => void;
	}> {
		constructor(token: string, pathToMainFile: string, options: MasterOptions);
		shardCount: number;
		firstShardID: number;
		lastShardID: number;
		clusterCount: number;
		token: string;
		clusters: Map<number, Cluster>;
		workers: Map<number, ChildProcess>;
		queue: null;
		options: {
			stats: boolean;
			debug: boolean;
		};
		statsInterval: number;
		mainFile: string;
		name: string;
		guildsPerShard: number;
		webhooks: {
			[k in "shard" | "cluster"]?: {
				id: string;
				token: string
			};
		};
		clientOptions: Eris.ClientOptions;
		callbacks: Map<string, number>;
		stats: MasterStats;

		isMaster(): boolean;
		startStats(): void;
		executeStats(clusters: Cluster[], start: number): void;
		start(clusterID: number): void;
		launch(test: boolean): void;
		chunk(shards: number, clusterCount: number): number[][];
		connectShards(): void;
		sendWebhook(type: "shard" | "cluster", embed: Eris.EmbedOptions): void;
		printLogo(): void;
		restartCluster(worker: null, code: number, signal: string): void;
		calculateShards(): Promise<number>;
		fetchInfo(start: number, type: string, value: string): void;
		broadcast(start: number, message: string): void;
		sendTo(cluster: number, message: any): void;
	}

	export { ClusterManager as Master };

	export class Cluster {
		shards: number;
		maxShards: number;
		firstShardID: number;
		lastShardID: number;
		mainFile: string;
		clusterID: number;
		clusterCount: number;
		guilds: number;
		users: number;
		uptime: number;
		exclusiveGuilds: number;
		largeGuilds: number;
		voiceChannels: number;
		shardStats: ShardStats[];
		app: any; // technically a class but there's nothing generic for this
		bot: Eris.Client;
		test: boolean;
		private constructor(); // not meant to be constructed publicly
		logOverride(message: any): string;
		spawn(): void;
		connect(firstShardID: number, lastShardID: number, maxShards: number, token: string, type: string, clientOptions: Eris.ClientOptions): void;
		loadCode(bot: Eris.Client): void;
		startStats(bot: Eris.Client): void;
	}

	export class Queue extends EventEmitter<{
		execute: (item: any) => void;
	}> {
		queue: any[];
		private constructor(); // not meant to be constructed publicly
		executeQueue(): void;
		queueItem(item: any): void;
	}

	export class IPC extends EventEmitter<{}> { // seems to extend EventEmitter for no reason - no events I can find
		events: Map<string, { fn: Function; }>;
		private constructor(); // not meant to be constructed publicly
		register(name: string, callback: Function): void;
		unregister(name: string): void;
		broadcast(name: string, message?: any): void;
		sendTo(cluster: number, name: string, message: any): void;
		fetchUser(id: string): Promise<Eris.User>;
		fetchGuild(id: string): Promise<Eris.Guild>;
		fetchChannel<T extends Eris.AnyChannel = Eris.AnyChannel>(id: string): Promise<T>;
		fetchMember(guildID: string, memberID: string): Promise<Eris.Member>;
	}

	export class Base {
		bot: Eris.Client;
		clusterID: number;
		ipc: IPC;
		constructor(setup: { bot: Eris.Client; clusterID: string; });

		restartCluster(clusterID: string): void;
	}
}
