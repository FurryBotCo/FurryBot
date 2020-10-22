import Cluster from "./Cluster";

export default abstract class Base {
	cluster: Cluster;
	constructor(d: Cluster) {
		this.cluster = d;
	}

	get bot() {
		return this.cluster.bot;
	}
	get ipc() {
		return this.cluster.ipc;
	}
	get clusterId() {
		return this.cluster.id;
	}
	get done(): () => Promise<void> {
		return this.cluster.done.bind(this.cluster);
	}

	abstract launch(shards: number): Promise<void>;
}
