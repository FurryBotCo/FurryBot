import ClientEvent from "../util/ClientEvent";
import Logger from "../util/LoggerV9";
import FurryBot from "../main";
import config from "../config";
import { Colors } from "../util/Constants";

export default new ClientEvent("shardDisconnect", (async function (this: FurryBot, err: Error, id: number) {
	this.track("events", "shardDisconnect");
	Logger.error("Shard Disconnect", `Shard #${id} disconnected.`);
	Logger.error("Shard Disconnect", err);
	return this.w.get("shard").execute({
		embeds: [
			{
				title: "Shard Disconnect",
				description: `Shard #${id} disconnected.`,
				timestamp: new Date().toISOString(),
				color: Colors.red
			}
		],
		username: `Furry Bot${config.beta ? " - Beta" : ""} Status`,
		avatarURL: config.images.botIcon
	}).catch(err => null);
}));
