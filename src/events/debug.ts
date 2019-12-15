import ClientEvent from "../util/ClientEvent";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";

export default new ClientEvent("debug", (async function (this: FurryBot, info: string, id: number) {
	if (!id) id = 0;
	this.increment([
		"events.debug"
	]);
	// too many for this
	if (typeof config !== "undefined" && config.debug === true) {
		if (["Duplicate presence update"].some(t => info.toLowerCase().indexOf(t.toLowerCase()) !== -1)) return;
		if (Logger !== undefined) return Logger.debug(`Shard #${id} | Client`, info);
		else return console.debug(info);
	}
}));
