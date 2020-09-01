import Cluster from "./Cluster";
import crypto from "crypto";
import Eris from "eris";
import Logger from "../util/Logger";
import { DEBUG } from "./ClusterManager";
import Stats from "./Stats";

class EvalError extends Error {
	constructor(name: string, message: string, stack: string) {
		super(message);
		this.name = name;
		this.stack = stack;
	}
}

export default class IPC {
	// I could make it fully private with "#" but that's overkill
	private cluster: Cluster;
	cb: Map<string, {
		resolve: (value?: unknown) => void;
		reject: (reason?: any) => void;
		data?: any;
	}>;
	constructor(cluster: Cluster) {
		this.cluster = cluster;
		this.cb = new Map();
	}

	async processMessage<D extends {
		type: string;
		callbackId: string;
		data: any;
		from: number;
		[k: string]: any;
	}>(d: D) {
		if (DEBUG) Logger.log(["IPC", this.cluster.id?.toString()], d);
		const c = this.cb.get(d.callbackId);
		if (!c) throw new TypeError("IPC message recieved with an invalid callback id.");
		switch (d.type) {
			/*case "fetchGuild":
			case "fetchUser":
			case "fetchChannel": {
				c.data.clustersAccountedFor.push(d.from);
				const h = d.data && Object.keys(d.data).length !== 0;
				if (c.data.clustersAccountedFor.length === this.cluster.clusterCount) {
					this.cb.delete(d.callbackId);
					if (!h && !c.data.completed) c.resolve(null);
					return;
				}
				else if (!h) return;
				c.resolve(d.data);
				this.cb.set(d.callbackId, {
					...c,
					data: {
						...c.data,
						completed: true
					}
				});
				this.cb.delete(d.callbackId);
				break;
			}*/

			case "evalAtCluster": {
				this.cb.delete(d.callbackId);
				if (d.data.error) c.reject(new EvalError(d.data.res.name, d.data.res.message, d.data.res.stack));
				else c.resolve({
					result: d.data.result,
					time: d.data.time
				});
				break;
			}

			case "evalAtMaster": {
				this.cb.delete(d.callbackId);
				if (d.data.error) c.reject(new EvalError(d.data.res.name, d.data.res.message, d.data.res.stack));
				else c.resolve({
					result: d.data.result,
					time: d.data.time
				});
				break;
			}

			case "getStats": {
				this.cb.delete(d.callbackId);
				c.resolve(d.data);
				break;
			}
		}
	}

	async broadcastEval<R = any>(code: string): Promise<(Clustering.EvalResponse<R> & { clusterId: number; })[]> {
		return Promise.all(Array.from(Array(this.cluster.clusterCount).keys()).map(async (id) => this.evalAtCluster<R>(id, code).then(v => ({ ...v, clusterId: id }))));
	}

	async evalAtCluster<R = any>(id: number, code: string) {
		return new Promise<Clustering.EvalResponse<R>>((resolve, reject) => {
			const callbackId = crypto.randomBytes(32).toString("hex");
			this.cluster.sendMessage("COMMAND", {
				type: "evalAtCluster",
				id,
				callbackId,
				code
			});
			this.cb.set(callbackId, {
				resolve,
				reject
			});
		});
	}

	async evalAtMaster<R = any>(code: string) {
		return new Promise<Clustering.EvalResponse<R>>((resolve, reject) => {
			const callbackId = crypto.randomBytes(32).toString("hex");
			this.cluster.sendMessage("COMMAND", {
				type: "evalAtMaster",
				callbackId,
				code
			});
			this.cb.set(callbackId, {
				resolve,
				reject
			});
		});
	}

	/*async getStats(): Promise<Clustering.Stats> {
		const {
			result: {
				clusters: cl,
				shards: sh,
				guilds,
				largeGuilds,
				channels,
				users,
				uptime,
				memory
			}
		} = await this.evalAtMaster<Clustering.EvalStats>("this.stats");
		const clusters: Clustering.Stats["clusters"] = new Map();
		const shards: Clustering.Stats["shards"] = new Map();
		for (const [id, d] of cl) {
			const t = d as any;
			t.shards = new Map(d.shards);
			clusters.set(id, t);
		}

		for (const [id, s] of sh) shards.set(id, s);

		return {
			clusters,
			shards,
			guilds,
			largeGuilds,
			channels,
			users,
			uptime,
			memory
		};
	}*/



	async getStats() {
		return new Promise<Stats>((resolve, reject) => {
			const callbackId = crypto.randomBytes(32).toString("hex");
			this.cluster.sendMessage("COMMAND", {
				type: "getStats",
				callbackId
			});

			this.cb.set(callbackId, {
				resolve: ((d: Clustering.EvalStats) => {
					const { clusters: cl, uptime, memory } = d;
					const clusters: Clustering.Stats["clusters"] = new Map();
					for (const [id, c] of cl) {
						const sh = new Map();
						for (const [i, v] of c.shards) sh.set(i, v);
						clusters.set(id, {
							...c,
							shards: sh
						});
					}

					resolve(new Stats({
						clusters,
						uptime,
						memory
					}));
				}),
				reject
			});
		});
	}

	/*async fetchGuild(id: string) {
		return new Promise<Eris.Guild>((resolve, reject) => {
			const callbackId = crypto.randomBytes(32).toString("hex");
			this.cluster.sendMessage("COMMAND", {
				type: "fetchGuild",
				id,
				callbackId
			});
			this.cb.set(callbackId, {
				resolve: (d: Eris.BaseData) => resolve(!d ? null : new Eris.Guild(d, this.cluster.client)),
				reject,
				data: {
					clustersAccountedFor: [],
					completed: false
				}
			});
		});
	}*/
}
