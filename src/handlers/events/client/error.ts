import { ClientEvent } from "bot-stuff";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";

export default new ClientEvent<FurryBot>("error", (async function (this: FurryBot, info: string, id: number) {
	if (!id) id = 0;
	await this.a.track("error", {
		clusterId: this.cluster.id,
		shardId: id,
		info,
		timestamp: Date.now()
	});

	/* await this.track("clientEvent", "events.error", {
		hostname: this.f.os.hostname(),
		beta: config.beta,
		clientId: config.bot.clientId,
		info,
		id
	}, new Date()); */

	if (Logger !== undefined) return Logger.error(`Cluster #${this.clusterId} | Shard #${id} | Client`, info);
	else return console.error(info);
}));
