import { Logger } from "@donovan_dmc/ws-clusters";
import config from "../config";
import blapi from "blapi";
import phin from "phin";

export default (async (shards: number[]) => {

	try {
		// a bit spammy
		// blapi.setLogging(true);
		blapi.manualPost(shards.reduce((a, b) => a + b, 0), config.bot.clientId, config.botLists, null, shards.length, shards);
		// botblock was blocked on discordbots.org
		const rq = await phin({
			method: "POST",
			url: `https://top.gg/api/bots/${config.bot.clientId}/stats`,
			data: {
				shards
			},
			headers: {
				"Content-Type": "application/json",
				"Authorization": config.botLists["discordbots.org"]
			}
		})
			.then(req => JSON.parse(req.body.toString()));
		Logger.log("Cluster Manager | Bot List Stats", `Posted guild counts: ${shards.reduce((a, b) => a + b, 0)}`);
	} catch (e) {
		Logger.error("Cluster Manager | Bot List Stats", e);
	}
	return {
		count: shards.reduce((a, b) => a + b, 0)
	};
});
