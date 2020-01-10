import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";

export default new ClientEvent("debug", (async function (this: FurryBot, info: string, id: number) {

	this.increment([
		"events.debug"
	]);
	if (typeof config !== "undefined" && config.debug === true) {
		// too many for this
		if (["Duplicate presence update"].some(t => info.toLowerCase().indexOf(t.toLowerCase()) !== -1)) return;
		if (Logger !== undefined) return [undefined, null].includes(id) ? Logger.debug("Debug", info) : Logger.debug(`Debug | Shard #${id}`, info);
		else return console.debug(info);
	}
}));
