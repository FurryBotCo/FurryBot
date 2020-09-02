import Eris from "eris";
import { EVAL_CODES } from "../../clustering/Constants";

declare global {
	namespace Clustering {

		export interface Options {
			erisOptions?: Eris.ClientOptions;
			clusterCount?: number | "auto";
			shardCount?: number | "auto";
			webhooks?: {
				[k in "shard" | "cluster"]?: {
					id: string;
					token: string;
					avatar?: string;
					username?: string;
				};
			};
			stats?: {
				enabled: boolean;
				interval?: number;
			};
			wait?: boolean;
			evalTimeout?: number;
		}

		export interface ShardStats {
			latency: number;
			lastHeartbeatReceived: number;
			lastHeartbeatSent: number;
			status: Eris.Shard["status"];
			guilds: number;
			largeGuilds: number;
			channels: number;
		}

		export interface ClusterStats {
			shards: Map<number, ShardStats>;
			readonly guilds: number;
			readonly largeGuilds: number;
			readonly channels: number;
			users: number;
			voiceConnections: number;
			uptime: number;
			memory: NodeJS.MemoryUsage;
		}

		export interface Stats {
			clusters: Map<number, ClusterStats>;
			readonly shards: Map<number, ShardStats & {
				clusterId: number
			}>;
			readonly guilds: number;
			readonly largeGuilds: number;
			readonly channels: number;
			readonly users: number;
			readonly voiceConnections: number;
			uptime: number;
			memory: {
				readonly clusters: NodeJS.MemoryUsage;
				readonly all: NodeJS.MemoryUsage;
				master: NodeJS.MemoryUsage;
			};
		}

		/*export interface EvalStats {
			clusters: [number, ClusterStats & {
				shards: [number, ShardStats][];
			}][];
			readonly shards: [number, ShardStats & {
				clusterId: number
			}][];
			readonly guilds: number;
			readonly largeGuilds: number;
			readonly channels: number;
			readonly users: number;
			uptime: number;
			memory: {
				readonly clusters: NodeJS.MemoryUsage;
				readonly all: NodeJS.MemoryUsage;
				master: NodeJS.MemoryUsage;
			};
		}*/

		export interface EvalStats {
			clusters: [number, ClusterStats & {
				shards: [number, ShardStats][];
			}][];
			uptime: number;
			memory: NodeJS.MemoryUsage;
		}

		export interface EvalResponse<R = any> {
			/* the result of the eval */
			result: R;
			/* the time it took in ms */
			time: number;
			/* the response code of the eval */
			code: typeof EVAL_CODES[keyof typeof EVAL_CODES];
		}
	}

}
