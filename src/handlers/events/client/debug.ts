import ClientEvent from "../../../modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";
import { Logger } from "@donovan_dmc/ws-clusters";

export default new ClientEvent("debug", (async function (this: FurryBot, info: string, id: number) {
	if (!id) id = 0;

	// too many for this
	/* await this.track("clientEvent", "events.debug", {
		hostname: this.f.os.hostname(),
		beta: config.beta,
		clientId: config.bot.clientID,
		info,
		id
	}, new Date());*/

	if (typeof config !== "undefined" && config.debug === true) {
		if (["Duplicate presence update"].some(t => info.toLowerCase().indexOf(t.toLowerCase()) !== -1)) return;
		if (Logger !== undefined) return Logger.debug(`Cluster #${this.clusterId} | Shard #${id}`, info);
		else return console.debug(info);
	}
}));
