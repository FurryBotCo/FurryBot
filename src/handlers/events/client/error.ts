import ClientEvent from "@modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "@config";

export default new ClientEvent("error", (async function (this: FurryBot, info: string, id: number) {
    if (this.logger !== undefined) return this.logger.error(info);
    else return console.error(info);
}));