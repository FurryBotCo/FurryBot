import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";

export default new ClientEvent("warn", (async function (this: FurryBot, info: string, id: number) {
	if (!id) id = 0;
	return this.log("warn", info, `Shard #${id} | Warn`);
}));
