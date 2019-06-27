import FurryBot from "@FurryBot";
import config from "@config";
import blapi from "blapi";
import phin from "phin";

export default (async (client: FurryBot) => {

	let g = [];
	try {
		for (let i = 0; i < client.shards.size; i++) g.push(Object.values(client.guildShardMap).filter(s => s === i).length);
		blapi.manualPost(client.guilds.size, client.user.id, config.botLists, 0, client.shards.size, g);
		// botblock was blocked on discordbots.org
		const rq = await phin({
			method: "POST",
			url: `https://discordbots.org/api/bots/${client.user.id}/stats`,
			data: {
				server_count: client.guilds.size,
				shard_count: client.shards.size
			},
			headers: {
				"Content-Type": "application/json",
				Authorization: config.botLists["discordbots.org"]
			}
		})
			.then(req => JSON.parse(req.body.toString()));
		client.logger.log(`Posted guild counts: ${client.guilds.size}`);
	} catch (e) {
		client.logger.error(e);
	}
	return {
		count: client.guilds.size
	};
});