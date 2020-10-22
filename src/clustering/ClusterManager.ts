/// <reference path="../util/@types/Events.d.ts" />
/// <reference path="../util/@types/Clustering.d.ts" />
/* eslint-disable @typescript-eslint/ban-types */

import cluster from "cluster";
import Cluster from "./Cluster";
import Eris from "eris";
import Logger from "../util/Logger";
import net from "net";
import EmbedBuilder from "../util/EmbedBuilder";
import config from "../config";
import { Colors } from "../util/Constants";
import Stats from "./Stats";
import { performance } from "perf_hooks";
import { DEBUG, SHARDS_PER_CLUSTER } from "./Constants";


export default class ClusterManager {
	// private client for webhooks & shard count
	#eris: Eris.Client;
	file: string;
	token: string;
	options: {
		erisOptions: Eris.ClientOptions;
		clusterCount: number; // 0 for "auto"
		shardCount: number; // 0 for "auto"
		webhooks: {
			[k in "shard" | "cluster"]: WebhookOptions | WebhookOptions[];
		};
		stats: {
			enabled: boolean;
			interval: number;
		};
		wait: boolean;
		evalTimeout: number;
	};
	clusters: Map<number, {
		worker: cluster.Worker;
		shards: number[];
		firstShardId: number;
		lastShardId: number;
	}>;
	cb: Map<string, number>; // cb to cluster id
	ready: boolean;
	#st: NodeJS.Timeout;
	stats: Stats;
	constructor(file: string, token: string, options: Clustering.Options) {
		if (cluster.isMaster) {
			// @FIXME
			// setTimeout(() => console.log(require("util").inspect(this.stats, { depth: null, colors: true })), 4e4);
			this.#eris = null;
			this.file = file;
			this.token = token;
			this.options = {
				erisOptions: options?.erisOptions ?? {},
				clusterCount: options?.clusterCount === "auto" ? 0 : options?.clusterCount ?? 0,
				shardCount: options?.shardCount === "auto" ? 0 : options?.shardCount ?? 0,
				webhooks: {
					shard: options?.webhooks?.shard || null,
					cluster: options?.webhooks?.cluster || null
				},
				stats: {
					enabled: !!options?.stats?.enabled,
					interval: options?.stats?.interval || 1.5e4
				},
				wait: !!options?.wait,
				evalTimeout: options?.evalTimeout || 2e4
			};
			this.clusters = new Map();
			this.cb = new Map();
			this.ready = false;
			if (this.options.stats.enabled) {
				this.#st = setInterval(() => {
					if (!this.ready) {
						if (DEBUG) Logger.debug(["Cluster Manager", "Stats"], "Skipping stats as not all clusters are ready.");
						return;
					}
					this.broadcast("COMMAND", {
						type: "stats"
					});
					this.stats.uptime = process.uptime() * 1000;
					this.stats.memory.master = process.memoryUsage();
				}, this.options.stats.interval);
				this.stats = new Stats();
				this.stats.memory.master = process.memoryUsage();
			} else this.stats = null;
		}
	}

	async launch() {
		if (cluster.isMaster) {
			const e = this.#eris = new Eris.Client(this.token);
			const c = await e.getBotGateway();

			if (!this.options.shardCount) this.options.shardCount = c.shards;
			if (!this.options.clusterCount) this.options.clusterCount = Math.ceil(this.options.shardCount / SHARDS_PER_CLUSTER);

			this.startCluster(0);
		} else {
			const c = new Cluster();
		}
	}

	private async startCluster(id: number) {
		if (id === this.options.clusterCount) {
			Logger.info("Cluster Manager", "All clusters have been launched!");

			this
				.spreadShards(
					Array.from(Array(this.options.shardCount).keys()),
					this.options.clusterCount
				)
				.map((s: number[], i) => this.clusters.set(i, {
					...this.clusters.get(i) ?? { worker: null },
					shards: s,
					firstShardId: Math.min(...s),
					lastShardId: Math.max(...s)
				}));

			for (const [id, { worker, shards, firstShardId, lastShardId }] of this.clusters) {
				worker.send({
					op: "SETUP",
					d: {
						id,
						maxShards: this.options.shardCount,
						token: this.token,
						file: this.file,
						shards,
						firstShardId,
						lastShardId,
						options: this.options
					}
				});
			}
		} else {
			Logger.info("Cluster Manager", `Launching Cluster #${id}`);
			const worker = cluster.fork();
			worker
				.on("message", this.workerMessageHandler.bind(this, id))
				.on("disconnect", () => this.clusterDisconnectHandler.bind(this, id));
			this.clusters.set(id, {
				worker,
				shards: [],
				firstShardId: null,
				lastShardId: null
			});

			this.startCluster(id + 1);
		}
	}

	private async connectCluster(id: number) {
		if (id === this.options.clusterCount) {
			// all clusters have readied
			if (this.ready) return;
			Logger.info("Cluster Manager", "All shards spread");
			this.broadcast("COMMAND", {
				type: "stats"
			});
			await new Promise((a, b) => setTimeout(a, 1e4));

			this.executeWebhook("cluster", {
				embed: new EmbedBuilder(config.devLanguage)
					.setColor(Colors.gold)
					.setTimestamp(new Date().toISOString())
					.setTitle("Fully Ready")
					.setDescription(`Client is fully ready, with (approximately) ${this.stats?.guilds || "Unknown"} servers.`)
					.setFooter(`${this.options.shardCount} Shard${this.options.shardCount !== 1 ? "s" : ""} | ${this.options.clusterCount} Cluster${this.options.clusterCount !== 1 ? "s" : ""}`)
					.toJSON()
			});
			this.ready = true;
			Logger.info("Cluster Manager", `Fully ready, with (approximately) ${this.stats?.guilds || "Unknown"} servers.`);
		} else {
			this.sendTo(id, "CONNECT", null);
		}
	}

	private async workerMessageHandler(id: number, msg: any, handle: net.Socket | net.Server) {
		if (DEBUG) Logger.log(["MASTER", id?.toString()], msg);
		switch (msg.op) {
			case "EVENT": {
				switch (msg.d.type as keyof ErisEventMap) {
					case "connect": {
						const { lastShardId } = this.clusters.get(id);
						const l = lastShardId - msg.d.id;
						this.executeWebhook("shard", {
							embed: new EmbedBuilder(config.devLanguage)
								.setColor(Colors.orange)
								.setTimestamp(new Date().toISOString())
								.setTitle("Shard Connect")
								.setDescription(`Shard #${msg.d.id} is connecting.`)
								.setFooter(`${l} Shard${l === 1 ? "" : "s"} Remaining. | Cluster ${id + 1}/${this.options.clusterCount}`)
								.toJSON()
						});
						Logger.info(["Cluster Manager", `Cluster #${id}`], `Shard #${msg.d.id} is connecting.`);
						break;
					}

					case "shardReady": {
						const { lastShardId } = this.clusters.get(id);
						const l = lastShardId - msg.d.id;
						this.executeWebhook("shard", {
							embed: new EmbedBuilder(config.devLanguage)
								.setColor(Colors.green)
								.setTimestamp(new Date().toISOString())
								.setTitle("Shard Ready")
								.setDescription(`Shard #${msg.d.id} is ready.`)
								.setFooter(`${l} Shard${l === 1 ? "" : "s"} Remaining. | Cluster ${id + 1}/${this.options.clusterCount}`)
								.toJSON()
						});
						Logger.info(["Cluster Manager", `Cluster #${id}`], `Shard #${msg.d.id} is ready.`);
						break;
					}

					case "shardResume": {
						this.executeWebhook("shard", {
							embed: new EmbedBuilder(config.devLanguage)
								.setColor(Colors.gold)
								.setTimestamp(new Date().toISOString())
								.setTitle("Shard Resumed")
								.setDescription(`Shard #${msg.d.id} resumed.`)
								.setFooter(`Shard #${msg.d.id}/${this.options.shardCount} | Cluster ${id + 1}/${this.options.clusterCount}`)
								.toJSON()
						});
						Logger.info(["Cluster Manager", `Cluster #${id}`], `Shard #${msg.d.id} resumed.`);
						break;
					}

					case "shardDisconnect": {
						this.executeWebhook("shard", {
							embed: new EmbedBuilder(config.devLanguage)
								.setColor(Colors.red)
								.setTimestamp(new Date().toISOString())
								.setTitle("Shard Disconnect")
								.setDescription(`Shard #${msg.d.id} disconnected.`)
								.setFooter(`Shard ${msg.d.id}/${this.options.shardCount} | Cluster ${id + 1}/${this.options.clusterCount}`)
								.toJSON()
						});
						Logger.info(["Cluster Manager", `Cluster #${id}`], `Shard #${msg.d.id} disconnected.`);
						Logger.error(["Cluster Manager", `Cluster #${id}`], msg.d.err);
						break;
					}

					case "ready": {
						this.executeWebhook("cluster", {
							embed: new EmbedBuilder(config.devLanguage)
								.setColor(Colors.green)
								.setTimestamp(new Date().toISOString())
								.setTitle("Cluster Ready")
								.setDescription(`Cluster #${id + 1} is ready.`)
								.setFooter(`Cluster ${id + 1}/${this.options.clusterCount}`)
								.toJSON()
						});
						break;
					}

					case "disconnect": {
						this.executeWebhook("cluster", {
							embed: new EmbedBuilder(config.devLanguage)
								.setColor(Colors.red)
								.setTimestamp(new Date().toISOString())
								.setTitle("Cluster Disconnect")
								.setDescription(`Cluster #${id + 1} disconnected.`)
								.setFooter(`Cluster ${id + 1}/${this.options.clusterCount}`)
								.toJSON()
						});
						break;
					}
				}
				break;
			}

			case "DONE": {
				this.connectCluster(id + 1);
				break;
			}

			case "COMMAND": {
				this.cb.set(msg.d.callbackId, id);
				switch (msg.d.type) {
					case "evalAtCluster": {
						this.sendTo(msg.d.id, "COMMAND", msg.d);
						break;
					}

					case "evalAtMaster": {
						this.cb.delete(msg.d.callbackId);
						const start = parseFloat(performance.now().toFixed(3));
						let result, error = false;
						try {
							result = await eval(msg.d.code);
						} catch (e) {
							error = true;
							result = {
								name: e.name,
								message: e.message,
								stack: e.stack
							};
						}
						const end = parseFloat(performance.now().toFixed(3));

						this.sendTo(id, "COMMAND_RESPONSE", {
							type: "evalAtMaster",
							ipc: true,
							callbackId: msg.d.callbackId,
							data: {
								result,
								error,
								time: parseFloat((end - start).toFixed(3))
							}
						});
						break;
					}

					case "getStats": {
						const clusters = [];
						if (this.stats && this.stats.clusters) for (const [id, c] of this.stats?.clusters.entries()) {
							const sh = [];
							for (const [id, s] of c.shards) sh.push([id, s]);
							clusters.push([id, {
								...c,
								shards: sh
							}]);
						}

						this.sendTo(id, "COMMAND_RESPONSE", {
							type: "getStats",
							ipc: true,
							callbackId: msg.d.callbackId,
							data: {
								clusters,
								uptime: this.stats?.uptime,
								memory: this.stats?.memory.master
							}
						});
						break;
					}
				}
				break;
			}

			case "SETUP_COMPLETE": {
				if (id === 0) this.connectCluster(id);
				else {
					if (this.ready) this.connectCluster(id);
				}
				break;
			}

			case "COMMAND_RESPONSE": {
				const o = this.cb.get(msg.d.callbackId);
				if (msg.d.ipc) this.sendTo(o, msg.op, {
					...msg.d,
					from: id
				});
				else {
					switch (msg.d.type) {
						case "stats": {
							const shards = new Map(msg.d.data.shards);
							delete msg.d.data.shards;
							this.stats.clusters.set(id, {
								...msg.d.data,
								shards
							});
							break;
						}
					}
				}
				break;
			}

			case "TEST": {
				console.log(msg.d instanceof Eris.Guild);
				break;
			}
		}
	}

	private async clusterDisconnectHandler(id: number) {
		Logger.error("Cluster Manager", `Cluster #${id} disconnected.`);
	}

	spreadShards(shards: number[], clusterCount: number) {
		if (clusterCount < 2) return [shards];
		const c = [];
		let i = 0, size: number;

		if (shards.length % clusterCount === 0) {
			size = Math.floor(shards.length / clusterCount);

			while (i < shards.length) {
				c.push(shards.slice(i, i += size));
			}
		} else {
			while (i < shards.length) {
				size = Math.ceil((shards.length - i) / clusterCount--);
				c.push(shards.slice(i, i += size));
			}
		}

		return c;
	}

	async executeWebhook(type: keyof ClusterManager["options"]["webhooks"], data: Eris.MessageContent, index?: number) {
		let w = this.options.webhooks[type];
		if (typeof index === "number") w = w[index]!;
		if (!w) return;
		const p: Eris.WebhookPayload = {
			wait: false
		};
		if (w instanceof Array) await Promise.all(w.map(async (_, i) => this.executeWebhook(type, data, i)));
		else {
			if (w.avatar) p.avatarURL = w.avatar;
			if (w.username) p.username = config.beta ? w.username.replace(/Furry Bot/, "Furry Bot Beta") : w.username;
			if (typeof data === "string") p.content = data;
			else {
				if (data.content) p.content = data.content;
				if (data.embed) p.embeds = [data.embed];
			}

			await this.#eris.executeWebhook(w.id, w.token, p);
		}
	}

	broadcast(op: string, d: object) {
		const res = new Array(this.options.clusterCount).fill(false);
		for (const [id] of this.clusters) {
			res[id] = this.sendTo(id, op, d);
		}

		return true;
	}

	sendTo(id: number, op: string, d: object) {
		const c = this.clusters.get(id);
		if (!c) return false;
		c.worker.send({
			op,
			d
		});
		return true;
	}
}
