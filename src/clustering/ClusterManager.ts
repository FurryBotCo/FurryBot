import { Options } from "./types";
import { SomePartial } from "utilities";
import { EventEmitter } from "tsee";
import { Client } from "eris";
import Logger from "logger";
import chunk from "chunk";
import path from "path";

class ClusterManager extends EventEmitter {
	options: Omit<Options, "shardCount" | "clusterCount"> & Record<"shardCount" | "clusteCount", number>;
	services = new Map<string, unknown>();
	clusters = new Map<string, unknown>();
	private eris: Client;
	private statsPaused = true;
	private launched = false;
	constructor(opts: SomePartial<Options, "path" | "token">) {
		super();
		this.options = {
			path: opts.path,
			token: opts.token,
			shardCount: !opts.shardCount || opts.shardCount === "auto" ? 0 : opts.shardCount,
			clusteCount: !opts.clusterCount || opts.clusterCount === "auto" ? 0 : opts.clusterCount,
			clientOptions: opts.clientOptions ?? {},
			clusterTimeout: opts.clusterTimeout ?? 5e3,
			serviceTimeout: opts.serviceTimeout ?? 0,
			killTimeout: opts.killTimeout ?? 1e4,
			nodeArgs: opts.nodeArgs ?? [],
			statsInterval: 6e4,
			firstShardId: opts.firstShardId ?? 0,
			lastShardId: opts.lastShardId ?? 0,
			fetchTimeout: opts.fetchTimeout ?? 1e4,
			startingStatus: opts.startingStatus ?? null,
			services: []
		};
		if (!path.isAbsolute(this.options.path)) throw new Error("Provided path must be absolute.");
		(opts.services ?? []).forEach(service => {
			if (!path.isAbsolute(service.path)) throw new Error(`Provided path for the service "${service.path}" must be absolute.`);
			const d = this.options.services.find(s => s.name === service.name);
			if (d) throw new Error(`Duplicate service name ${service.name} in file ${service.path}`);
			this.options.services.push(service);
		});
		this.eris = new Client(`Bot ${this.options.token}`, {
			restMode: true
		});
	}

	async launch() {
		if (this.launched) throw new Error("Already launched.");
		this.launched = true;
		let count = this.options.shardCount;
		if (count < 1) {
			const rec = await this.eris.getBotGateway();
			Logger.debug("ClusterManager", `Gateway reccomends ${rec.shards} shards`);
			count = rec.shards;
		}

		// easiest way I could think of
		const shards = Array.from(new Array(count)).map((_, i) => i + 1);
		const spread = chunk(shards);
	}
}
