import config from "../config";
import FurryBot from "../main";
import { ClientEvent, EmbedBuilder, Colors } from "core";

export default new ClientEvent<FurryBot>("shardDisconnect", async function(err, id) {
	void this.w.get("shard")!.execute({
		embeds: [
			new EmbedBuilder(config.devLanguage)
				.setTitle("Shard Disconnected")
				.setDescription(`Shard #${id} disconnected.`)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.red)
				.setFooter(`Cluster #${this.clusterId + 1}`)
				.toJSON()
		],
		username: `Furry Bot${config.beta ? " Beta -" : ""} Shard Status`,
		avatarURL: config.images.icons.bot
	});
});
