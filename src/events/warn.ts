import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import config from "../config";
import rClient from "../util/Redis";

export default new ClientEvent("warn", (async function (this: FurryBot, info: string, id: number) {
	rClient.INCR(`${config.beta ? "beta" : "prod"}:events:warn`);
	if (!id) id = 0;
	return this.log("warn", info, `Shard #${id} | Warn`);
}));
