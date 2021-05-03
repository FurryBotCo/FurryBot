import { BotActivityType, ClientOptions, Status } from "eris";
declare namespace ClusterTypes {

	interface StartingStatus {
		status: Status;
		game?: {
			name: string;
			type: BotActivityType;
			url?: string;
		};
	}

	interface Options {
		path: string;
		token: string;
		shardCount: number | "auto";
		clusterCount: number | "auto";
		clientOptions: ClientOptions;
		clusterTimeout: number;
		serviceTimeout: number;
		killTimeout: number;
		nodeArgs: Array<string>;
		statsInterval: number;
		firstShardId: number;
		lastShardId: number;
		fetchTimeout: number;
		startingStatus: StartingStatus | null;
		services: Array<ServiceCreator>;
	}

	interface ServiceCreator {
		name: string;
		path: string;
	}
}

export = ClusterTypes;
