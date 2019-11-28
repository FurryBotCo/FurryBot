import { ClientEvent } from "bot-stuff";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";

export default new ClientEvent<FurryBot>("warn", (async function (this: FurryBot, info: string, id: number) {
	if (!id) id = 0;
	await this.a.track("warn", {
		clusterId: this.cluster.id,
		shardId: id,
		info,
		timestamp: Date.now()
	});

	if (Logger !== undefined) return Logger.warn(`Cluster #${this.clusterId} | Shard #${id} | Client`, info);
	else return console.warn(info);
}));
