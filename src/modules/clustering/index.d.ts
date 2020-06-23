import ClusterStats from "./src/@types/ClusterStats";
import ShardStats from "./src/@types/ShardStats";
import ManagerOptions from "./src/@types/ManagerOptions";
import Cluster from "./src/Cluster";
import ClusterManager from "./src/ClusterManager";
import Base from "./src/Base";

declare namespace Clustering {
	export {
		ClusterStats,
		ShardStats,
		ManagerOptions,
		Cluster,
		ClusterManager,
		Base
	};
}

export = Clustering;
