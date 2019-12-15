import ClientEvent from "../util/ClientEvent";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";

export default new ClientEvent("warn", (async function (this: FurryBot, info: string, id: number) {
	if (!id) id = 0;
	this.increment([
		"events.warn"
	]);

	if (Logger !== undefined) return Logger.warn(`Shard #${id} | Client`, info);
	else return console.warn(info);
}));
