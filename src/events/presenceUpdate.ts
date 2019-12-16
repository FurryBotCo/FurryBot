import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";

export default new ClientEvent("presenceUpdate", (async function (this: FurryBot, other: Eris.Member | Eris.Relationship, oldPresence?: Eris.OldPresence) {
	if (!(!this || !this.increment || !this.decrement || !this.ddog)) try {
		this.increment([
			"events.presenceUpdate"
		]);
	} catch (e) { }
}));
