import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import config from "../config";
import { Colors } from "../util/Constants";

export default new ClientEvent("shardReady", (async function (this: FurryBot, id: number) {
	Logger.log("Shard Ready", `Shard #${id} is ready.`);
	if (!this.firstReady) this.shards.get(id).editStatus("idle", { name: "Not ready yet..", type: 0 });
	return this.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
		embeds: [
			{
				title: "Shard Ready",
				description: `Shard #${id} is ready.`,
				timestamp: new Date().toISOString(),
				color: Colors.green
			}
		],
		username: `Furry Bot${config.beta ? " - Beta" : ""} Status`,
		avatarURL: "https://i.furry.bot/furry.png"
	}).catch(err => null);
}));
