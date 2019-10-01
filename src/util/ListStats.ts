import { Main, Logger } from "@donovan_dmc/ws-clusters";
import config from "../config";
import blapi from "blapi";
import phin from "phin";

export default (async (client: Main) => {

	const g = [];
	try {
		blapi.manualPost(client.stats.guildCount, client.stats.userCount, config.botLists, 0, client.stats.shardCount, g);
		// botblock was blocked on discordbots.org
		const rq = await phin({
			method: "POST",
			url: `https://discordbots.org/api/bots/${client.eris.user.id}/stats`,
			data: {
				server_count: client.stats.guildCount,
				shard_count: client.stats.shardCount
			},
			headers: {
				"Content-Type": "application/json",
				"Authorization": config.botLists["discordbots.org"]
			}
		})
			.then(req => JSON.parse(req.body.toString()));
		Logger.log("Cluster Manager | Bot List Stats", `Posted guild counts: ${client.stats.guildCount}`);
	} catch (e) {
		Logger.error("Cluster Manager | Bot List Stats", e);
	}
	return {
		count: client.stats.guildCount
	};
});
