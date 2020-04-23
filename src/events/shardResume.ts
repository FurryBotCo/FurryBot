import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "../main";
import config from "../config";
import { Colors } from "../util/Constants";
import rClient from "../util/Redis";

export default new ClientEvent("shardResume", (async function (this: FurryBot, id: number) {
	rClient.INCR(`${config.beta ? "beta" : "prod"}:events:shardResume`);
	Logger.log("Shard Ready", `Shard #${id} resumed.`);
	return this.executeWebhook(config.webhooks.shard.id, config.webhooks.shard.token, {
		embeds: [
			{
				title: "Shard Resumed",
				description: `Shard #${id} resumed.`,
				timestamp: new Date().toISOString(),
				color: Colors.gold
			}
		],
		username: `Furry Bot${config.beta ? " - Beta" : ""} Status`,
		avatarURL: "https://i.furry.bot/furry.png"
	}).catch(err => null);
}));
