import ClientEvent from "../../../modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config/config";

export default new ClientEvent("warn", (async function (this: FurryBot, info: string, id: number) {
	if (!id) id = 0;
	if (this.logger !== undefined) return this.logger.warn(info, id);
	else return console.warn(info, id);
}));