import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "../main";
import config from "../config";
import { Colors } from "../util/Constants";
import rClient from "../util/Redis";

export default new ClientEvent("shardDisconnect", (async function (this: FurryBot, err: Error, id: number) {
	rClient.INCR(`${config.beta ? "beta" : "prod"}:events:shardDisconnect`);
	Logger.error("Shard Disconnect", `Shard #${id} disconnected.`);
	Logger.error("Shard Disconnect", err);
	return this.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
		embeds: [
			{
				title: "Shard Disconnect",
				description: `Shard #${id} disconnected.`,
				timestamp: new Date().toISOString(),
				color: Colors.red
			}
		],
		username: `Furry Bot${config.beta ? " - Beta" : ""} Status`,
		avatarURL: "https://i.furry.bot/furry.png"
	}).catch(err => null);
}));
