import ClientEvent from "../util/ClientEvent";
import Logger from "../util/LoggerV9";
import FurryBot from "../main";
import config from "../config";
import { Colors } from "../util/Constants";

export default new ClientEvent("shardReady", (async function (this: FurryBot, id: number) {
	this.track("events", "shardReady");
	Logger.log("Shard Ready", `Shard #${id} is ready.`);
	if (!this.firstReady) this.shards.get(id).editStatus("idle", { name: "Not ready yet..", type: 0 });
	return this.w.get("shard").execute({
		embeds: [
			{
				title: "Shard Ready",
				description: `Shard #${id} is ready.`,
				timestamp: new Date().toISOString(),
				color: Colors.green
			}
		],
		username: `Furry Bot${config.beta ? " - Beta" : ""} Status`,
		avatarURL: config.images.botIcon
	}).catch(err => null);
}));
