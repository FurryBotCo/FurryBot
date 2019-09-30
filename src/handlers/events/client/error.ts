import ClientEvent from "../../../modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";
import { Logger } from "@donovan_dmc/ws-clusters";

export default new ClientEvent("error", (async function (this: FurryBot, info: string, id: number) {
	if (!id) id = 0;

	/* await this.track("clientEvent", "events.error", {
		hostname: this.f.os.hostname(),
		beta: config.beta,
		clientId: config.bot.clientID,
		info,
		id
	}, new Date()); */

	if (Logger !== undefined) return Logger.error(info, id);
	else return Logger.error(`Cluster #${this.clusterId} | Shard #${id}`, info);
}));
