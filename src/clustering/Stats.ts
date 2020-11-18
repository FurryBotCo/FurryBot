/// <reference path="../util/@types/Clustering.d.ts" />
export default class Stats implements Clustering.Stats {
	clusters: Clustering.Stats["clusters"];
	uptime: number;
	#memory: NodeJS.MemoryUsage;
	constructor(start?: {
		clusters?: Clustering.Stats["clusters"];
		uptime?: number;
		memory?: NodeJS.MemoryUsage;
	}) {
		this.clusters = start?.clusters ?? new Map();
		this.uptime = start?.uptime ?? Math.floor(process.uptime() * 1000);
		this.#memory = start?.memory ?? {
			rss: 0,
			heapTotal: 0,
			heapUsed: 0,
			external: 0,
			arrayBuffers: 0
		};

		try {
			Object.defineProperty(this.clusters, "toJSON", {
				value(this: Clustering.Stats["clusters"]) {
					const v = [];
					for (const [a, b] of this.entries()) v.push([a, {
						...b,
						shards: Array.from(b.shards.entries())
					}]);
					return v;
				}
			});

			Object.defineProperty(this.shards, "toJSON", {
				value(this: Clustering.Stats["shards"]) {
					return Array.from(this.entries());
				}
			});
		} catch (e) { }
	}

	get shards() {
		const s: Clustering.Stats["shards"] = new Map();
		for (const [clusterId, { shards }] of (this.clusters)) {
			for (const [shardId, sh] of shards) s.set(shardId, {
				clusterId,
				...sh
			});
		}

		return s;
	}

	get guilds() {
		return Array.from((this.clusters).values()).reduce((a, b) => a + Array.from(b.shards.values()).reduce((c, d) => c + d.guilds, 0), 0);
	}

	get largeGuilds() {
		return Array.from((this.clusters).values()).reduce((a, b) => a + Array.from(b.shards.values()).reduce((c, d) => c + d.largeGuilds, 0), 0);
	}

	get channels() {
		return Array.from((this.clusters).values()).reduce((a, b) => a + Array.from(b.shards.values()).reduce((c, d) => c + d.channels, 0), 0);
	}

	get users() {
		return Array.from((this.clusters).values()).reduce((a, b) => a + b.users, 0);
	}

	get voiceConnections() {
		return Array.from((this.clusters).values()).reduce((a, b) => a + b.voiceConnections, 0);
	}

	get clusterMemory() {
		return Array.from(this.clusters.values()).reduce((a, b) => ({
			rss: a.rss + b.memory.rss,
			heapUsed: a.heapUsed + b.memory.heapUsed,
			heapTotal: a.heapTotal + b.memory.heapTotal,
			external: a.external + b.memory.external
		}) as NodeJS.MemoryUsage, {
			rss: 0,
			heapTotal: 0,
			heapUsed: 0,
			external: 0,
			arrayBuffers: 0
		} as NodeJS.MemoryUsage);
	}

	get allMemory() {
		const m = Array.from(this.clusters.values()).reduce((a, b) => ({
			rss: a.rss + b.memory.rss,
			heapUsed: a.heapUsed + b.memory.heapUsed,
			heapTotal: a.heapTotal + b.memory.heapTotal,
			external: a.external + b.memory.external
		}) as NodeJS.MemoryUsage, {
			rss: 0,
			heapTotal: 0,
			heapUsed: 0,
			external: 0,
			arrayBuffers: 0
		} as NodeJS.MemoryUsage);
		for (const key of Object.keys(m)) m[key] += this.memory.master[key];

		return m;
	}

	get memory() {
		const self = this;
		const obj = {
			get clusters() {
				return Array.from(self.clusters.values()).reduce((a, b) => ({
					rss: a.rss + b.memory.rss,
					heapUsed: a.heapUsed + b.memory.heapUsed,
					heapTotal: a.heapTotal + b.memory.heapTotal,
					external: a.external + b.memory.external
				}) as NodeJS.MemoryUsage, {
					rss: 0,
					heapTotal: 0,
					heapUsed: 0,
					external: 0,
					arrayBuffers: 0
				} as NodeJS.MemoryUsage);
			},
			get all() {
				const m = Array.from(self.clusters.values()).reduce((a, b) => ({
					rss: a.rss + b.memory.rss,
					heapUsed: a.heapUsed + b.memory.heapUsed,
					heapTotal: a.heapTotal + b.memory.heapTotal,
					external: a.external + b.memory.external
				}) as NodeJS.MemoryUsage, {
					rss: 0,
					heapTotal: 0,
					heapUsed: 0,
					external: 0,
					arrayBuffers: 0
				} as NodeJS.MemoryUsage);
				for (const key of Object.keys(m)) m[key] += self.memory.master[key];

				return m;
			},
			get master() {
				return self.#memory;
			},
			set master(m) {
				self.#memory = m;
			}
		} as Clustering.Stats["memory"];

		return obj;
	}

	toJSON() {
		const obj = { ...this };

		// add all properties
		const proto = Object.getPrototypeOf(this);
		for (const key of Object.getOwnPropertyNames(proto)) {
			const desc = Object.getOwnPropertyDescriptor(proto, key);
			const hasGetter = desc && typeof desc.get === "function";
			if (hasGetter) {
				obj[key] = desc.get.call(this);
				if (obj[key] instanceof Map) obj[key] = Array.from(obj[key].entries());
			}
		}

		// console.log(require("util").inspect(obj, { depth: null, colors: true }));

		return obj;
	}
}
