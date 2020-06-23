import Eris from "eris";
import Cluster from "./Cluster";


export default class Base {
	cluster: Cluster;
	constructor(cluster: Cluster) {
		this.cluster = cluster;
	}

	get bot() { return this.cluster.bot; }
	launch: () => Promise<void>;
}
