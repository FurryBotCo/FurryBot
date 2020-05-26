import ClientEvent from "../util/ClientEvent";
import Logger from "../util/LoggerV9";
import FurryBot from "../main";
import config from "../config";
import { Colors } from "../util/Constants";

export default new ClientEvent("shardResume", (async function (this: FurryBot, id: number) {
	this.track("events", "shardResume");
	Logger.log("Shard Ready", `Shard #${id} resumed.`);
	return this.w.get("shard").execute({
		embeds: [
			{
				title: "Shard Resumed",
				description: `Shard #${id} resumed.`,
				timestamp: new Date().toISOString(),
				color: Colors.gold
			}
		],
		username: `Furry Bot${config.beta ? " - Beta" : ""} Status`,
		avatarURL: config.images.botIcon
	}).catch(err => null);
}));
