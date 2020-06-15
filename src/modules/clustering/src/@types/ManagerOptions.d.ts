import Eris from "eris";

export default interface ManagerOptions {
	/**
	 * The stats options
	 */
	stats?: {
		/**
		 * Setting to true enables sending stats from clusters.
		 * @type {boolean}
		 */
		enable?: boolean;
		/**
		 * The amount in milliseconds between stats postings.
		 * @type {number}
		 */
		time?: number;
	};
	/**
	 * The webhooks to post info to.
	 */
	webhooks?: {
		[k in "shard" | "cluster"]?: {
			id: string;
			token: string;
			avatar?: string;
			name?: string;
		}
	};
	/**
	 * The client options to pass to the Eris instances.
	 * @type {Eris.ClientOptions}
	 * @memberof ManagerOptions
	 */
	clientOptions?: Eris.ClientOptions;
	/**
	 * The amount of clusters to launch.
	 * @type {(number | "auto")}
	 * @memberof ManagerOptions
	 */
	clusterCount?: number | "auto";
	/**
	 * The amount of shards to launch.
	 * @type {(number | "auto")}
	 * @memberof ManagerOptions
	 */
	shardCount?: number | "auto";
	/**
	 * The time to wait between launching clusters. Must be 5 or more.
	 * @type {number}
	 * @memberof ManagerOptions
	 */
	clusterTimeout?: number;
	/**
	 * The first shard id to launch.
	 * @type {number}
	 * @memberof ManagerOptions
	 */
	firstShardId?: number;
	/**
	 * The last shard id to launch.
	 * @type {number}
	 * @memberof ManagerOptions
	 */
	lastShardId?: number;
	/**
	 * The amount of average guilds per shard.
	 * @type {number}
	 * @memberof ManagerOptions
	 */
	guildsPerShard?: number;
	/**
	 * The node executable path to use when spawning clusters.
	 * @type {string}
	 * @memberof ManagerOptions
	 */
	nodeExecutablePath?: string;
}
