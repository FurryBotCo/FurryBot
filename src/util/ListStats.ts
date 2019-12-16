import { Logger } from "../util/LoggerV8";
import config from "../config";
import phin from "phin";

export default (async (shards: number[]) => {
	if (!shards || shards.length === 0) throw new TypeError("invalid shards provided");
	try {
		await phin({
			method: "POST",
			url: "https://botblock.org/api/count",
			data: {
				server_count: shards.reduce((a, b) => a + b, 0),
				bot_id: config.bot.clientId,
				shard_count: shards.length,
				shards,
				...config.botLists
			},
			timeout: 1e4
		});

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
			},
			timeout: 1e4
		})
			.then(req => JSON.parse(req.body.toString()));
		Logger.log("Bot List Stats", `Posted guild counts: ${shards.reduce((a, b) => a + b, 0)}`);
	} catch (e) {
		Logger.error("Bot List Stats", e);
	}
	return {
		count: shards.reduce((a, b) => a + b, 0)
	};
});
