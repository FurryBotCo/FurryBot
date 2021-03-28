import config from "../config";
import FurryBot from "../main";
import { ClientEvent, EmbedBuilder, Colors } from "core";

export default new ClientEvent<FurryBot>("shardResume", async function(id) {
	void this.w.get("shard")!.execute({
		embeds: [
			new EmbedBuilder(config.devLanguage)
				.setTitle("Shard Resumed")
				.setDescription(`Shard #${id} resumed.`)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.orange)
				.setFooter(`Cluster #${this.clusterId + 1}`)
				.toJSON()
		],
		username: `Furry Bot${config.beta ? " Beta -" : ""} Shard Status`,
		avatarURL: config.images.icons.bot
	});
});
