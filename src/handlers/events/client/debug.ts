import ClientEvent from "@modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "@config";

export default new ClientEvent("debug", (async function (this: FurryBot, info: string, id: number) {
    if (typeof config !== "undefined" && config.debug === true) {
        if (["Duplicate presence update"].some(t => info.toLowerCase().indexOf(t.toLowerCase()) !== -1)) return;
        if (this.logger !== undefined) return this.logger.debug(info);
        else return console.debug(info);
    }
}));