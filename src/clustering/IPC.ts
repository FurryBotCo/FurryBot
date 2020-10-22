import Cluster from "./Cluster";
import crypto from "crypto";
import Logger from "../util/Logger";
import { DEBUG, EVAL_CODES } from "./Constants";
import Stats from "./Stats";

function parse(d: Function | string) { // eslint-disable-line @typescript-eslint/ban-types
	if (typeof d === "string") return d;
	if (typeof d === "function") d = d.toString();
	return `(async()=>{${d.slice(d.indexOf("{") + 1, d.lastIndexOf("}")).trim()}})()`;
}

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
		resolve: (value: {
			result: any;
			time: number;
			code: typeof EVAL_CODES[keyof typeof EVAL_CODES];
		}) => void;
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
		if (!c) Logger.warn([`Cluster #${this.cluster.id}`, "IPC"], `IPC message recieved with an invalid callback id. (ID: ${d.callbackId || "NONE"})`);
		switch (d.type) {
			/* case "fetchGuild":
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
				// if ([1, 3].includes(d.from) && d.data?.result !== "NOT_READY") return;
				this.cb.delete(d.callbackId);
				if (d.data.error) c.reject(new EvalError(d.data.res.name, d.data.res.message, d.data.res.stack));
				else if (d.data.result === "NOT_READY") c.resolve({
					result: null,
					time: 0,
					code: EVAL_CODES.NOT_READY
				});
				else c.resolve({
					result: d.data.result,
					time: d.data.time,
					code: EVAL_CODES.SUCCESS
				});
				break;
			}

			case "evalAtMaster": {
				this.cb.delete(d.callbackId);
				if (d.data.error) c.reject(new EvalError(d.data.res.name, d.data.res.message, d.data.res.stack));
				else c.resolve({
					result: d.data.result,
					time: d.data.time,
					code: 0
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

	async broadcastEval<R = any>(code: ((this: Cluster) => Promise<any>) | string): Promise<(Clustering.EvalResponse<R> & { clusterId: number; })[]> {
		return Promise.all(Array.from(Array(this.cluster.options.clusterCount).keys()).map(async (id) => this.evalAtCluster<R>(id, code).then(v => ({ ...v, clusterId: id }))));
	}

	async evalAtCluster<R = any>(id: number, code: ((this: Cluster) => Promise<any>) | string) {
		return new Promise<Clustering.EvalResponse<R>>((resolve, reject) => {
			const callbackId = crypto.randomBytes(32).toString("hex");
			this.cluster.sendMessage("COMMAND", {
				type: "evalAtCluster",
				id,
				callbackId,
				code: parse(code)
			});
			setTimeout(() => {
				resolve({
					result: null,
					time: 0,
					code: EVAL_CODES.NO_RESPONSE
				});
			}, this.cluster.options.evalTimeout);
			this.cb.set(callbackId, {
				resolve,
				reject
			});
		});
	}

	async evalAtMaster<R = any>(code: ((this: Cluster) => Promise<any>) | string) {
		return new Promise<Clustering.EvalResponse<R>>((resolve, reject) => {
			const callbackId = crypto.randomBytes(32).toString("hex");
			this.cluster.sendMessage("COMMAND", {
				type: "evalAtMaster",
				callbackId,
				code: parse(code)
			});
			this.cb.set(callbackId, {
				resolve,
				reject
			});
		});
	}

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
				}) as any, // special case callback
				reject
			});
		});
	}

	/* async fetchGuild(id: string) {
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
