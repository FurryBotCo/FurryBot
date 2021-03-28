import config from "../config";
import FurryBot from "../main";
import { ClientEvent, EmbedBuilder, Colors } from "core";

export default new ClientEvent<FurryBot>("connect", async function(id) {
	void this.w.get("shard")!.execute({
		embeds: [
			new EmbedBuilder(config.devLanguage)
				.setTitle("Shard Connected")
				.setDescription(`Shard #${id} connected.`)
				.setTimestamp(new Date().toISOString())
				.setColor(Colors.green)
				.setFooter(`Shard ${id + 1}/${this.bot.shards.size} | Cluster #${this.clusterId + 1}`)
				.toJSON()
		],
		username: `Furry Bot${config.beta ? " Beta -" : ""} Shard Status`,
		avatarURL: config.images.icons.bot
	});
});
