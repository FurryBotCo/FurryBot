import * as fs from "fs";
import { EventEmitter } from "tsee";
import ManagerOptions from "./@types/ManagerOptions";
import Base from "./Base";
import Eris from "eris";
import { spawn } from "child_process";


export default class ClusterManager extends EventEmitter<{}> {
	token: string;
	mainFile: string;
	options: Omit<
		Required<ManagerOptions>,
		"shardCount" | "clusterCount"
	> & {
			/* changed here due to "auto" being possible in the interface, and that not being possible here */
			[k in "shardCount" | "clusterCount"]: number;
		};
	private eris: Eris.Client;
	constructor(token: string, mainFile: string, options: ManagerOptions) {
		super();
		if (!token) throw new TypeError("Missing token.");
		if (!mainFile) throw new TypeError("Missing main file.");
		if (!fs.existsSync(mainFile)) throw new TypeError("Main file does not exist.");
		let m = require(mainFile);
		if (m.default) m = m.default;
		if (!(m.prototype instanceof Base)) throw new TypeError("Main file does not extend base.");
		this.token = token;
		this.mainFile = mainFile;
		this.options = {
			stats: {
				enable: !options.stats ? false : !!options.stats.enable,
				time: !options.stats ? 5e3 : options.stats.time || 1e3
			},
			webhooks: {
				shard: !options.webhooks ? null : options.webhooks.shard,
				cluster: !options.webhooks ? null : options.webhooks.cluster
			},
			clientOptions: options.clientOptions || {},
			clusterTimeout: options.clusterTimeout || 5e3,
			clusterCount: !options.clusterCount ? null : options.clusterCount === "auto" ? null : options.clusterCount,
			shardCount: !options.shardCount ? null : options.shardCount === "auto" ? null : options.shardCount,
			firstShardId: options.firstShardId || 0,
			lastShardId: options.lastShardId || null, // I could make some complicated ternary junk but nah
			guildsPerShard: options.guildsPerShard || 1300,
			nodeExecutablePath: options.nodeExecutablePath || process.execPath
		};

		this.eris = new Eris.Client(token);
	}

	private spreadShards(shardCount: number, clusterCount: number) {
		const shards: number[] = [];
		for (let i = 0; i < shardCount; i++) shards.push(i);
		if (clusterCount < 2) return [shards];

		const out: number[][] = [];
		let i = 0;
		let size;

		if (shards.length % clusterCount === 0) {
			size = Math.floor(shards.length / clusterCount);

			while (i < shards.length) {
				out.push(shards.slice(i, i += size));
			}
		} else {
			while (i < shards.length) {
				size = Math.ceil((shards.length - i) / clusterCount--);
				out.push(shards.slice(i, i += size));
			}
		}

		return out;
	}

	log(type: string, name: string, message: any) {
		process.stdout.write(`General | ${type} | ${name} | ${message}`);
	}

	async calculateShards() {
		if (this.options.shardCount !== 0) return this.options.shardCount;

		const g = await this.eris.getBotGateway();

		if (g.shards === 1) return 1;

		return Math.ceil((g.shards * 1000) / this.options.guildsPerShard);
	}

	private async startCluster(id: number) {
		const shards = this.spreadShards(this.options.shardCount, this.options.clusterCount)[id];
		if (!shards) throw new TypeError(`No shards found for cluster #${id}.`);
		const first = shards[0];
		const last = shards[shards.length - 1];

		spawn(process.execPath, [
			`${__dirname}/Cluster.js`
		], {});
	}
}
