import Logger from "./LoggerV9";
import config from "../config";
import phin from "phin";
import FurryBot from "../main";
import { Fleet } from "eris-fleet";

export default (async (manager: Fleet) => {
	if (!manager.stats) throw new TypeError("List stats attempted when stats are not present.");

	try {
		await phin<any>({
			method: "POST",
			url: "https://botblock.org/api/count",
			data: {
				server_count: manager.stats.guilds,
				bot_id: config.client.id,
				shard_count: manager.stats.shardCount,
				...config.client.lists.map(l => ({ [l.site]: l.token })).reduce((a, b) => ({ ...a, ...b }))
			} as any,
			timeout: 1e4,
			parse: "json"
		});

		// botblock was blocked on top.gg
		const rq = await phin<any>({
			method: "POST",
			url: `https://top.gg/api/bots/${config.client.id}/stats`,
			data: {
				server_count: manager.stats.guilds,
				shard_count: manager.stats.shardCount
			} as any,
			headers: {
				"Content-Type": "application/json",
				"Authorization": config.client.lists.find(l => l.site === "top.gg").token
			},
			timeout: 1e4,
			parse: "json"
		})
			.then(req => {
				try {
					return JSON.parse(req.body.toString());
				} catch (e) {
					Logger.error("Bot List Stats", req.body);
					Logger.error("Bot List Stats", `${req.statusCode} ${req.statusMessage}`);
				}
			});
		Logger.log("Bot List Stats", `Posted guild counts: ${manager.stats.guilds}`);
	} catch (e) {
		Logger.error("Bot List Stats", e);
	}

	return;
});
