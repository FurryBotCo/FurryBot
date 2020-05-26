import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";

export default new ClientEvent("warn", (async function (this: FurryBot, info: string, id: number) {
	this.track("events", "warn");
	if (!id) id = 0;
	return this.log("warn", info, `Shard #${id} | Warn`);
}));
