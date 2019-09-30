import ClientEvent from "../../../modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";
import { Logger } from "@donovan_dmc/ws-clusters";

export default new ClientEvent("warn", (async function (this: FurryBot, info: string, id: number) {
	if (!id) id = 0;

	/* await this.track("clientEvent", "events.warn", {
		hostname: this.f.os.hostname(),
		beta: config.beta,
		clientId: config.bot.clientID,
		info,
		id
	}, new Date()); */

	if (Logger !== undefined) return Logger.warn(info, id);
	else return Logger.warn(`Cluster #${this.clusterId} | Shard #${id}`, info);
}));
