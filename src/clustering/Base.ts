import Cluster from "./Cluster";
import IPC from "./IPC";

export default interface Base {
	new(d: Cluster): this; // tslint:disable-line callable-types
}


export default class Base {
	cluster: Cluster;
	constructor(d: Cluster) {
		this.cluster = d;
	}

	get bot() { return this.cluster.bot; }
	get ipc() { return this.cluster.ipc; }
	get clusterId() { return this.cluster.id; }
	get done() { return this.cluster.done.bind(this.cluster); }

	async launch(shards: number) {
	}
}
