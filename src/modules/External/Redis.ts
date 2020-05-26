/// <reference path="../../util/@types/async-redis.d.ts" />
/* tslint:disable variable-name */
import config from "../../config";
import Logger from "../../util/LoggerV9";
import RedisClient from "async-redis";

const Redis = RedisClient.createClient(config.apiKeys.redis.port, config.apiKeys.redis.host, {
	password: config.apiKeys.redis.password
});

Redis
	.on("error", (err) => {
		Logger.error("Redis", err);
	})
	.on("ready", () => {
		Redis.CLIENT("SETNAME", `FurryBot${config.beta ? "Beta" : "Production"}`);
		Logger.debug("Redis", "Ready");
	})
	// set some stats to zero on first ready
	.once("ready", () => {
		Redis.SET(`${config.beta ? "beta" : "prod"}:stats:messages`, "0");
		Redis.SET(`${config.beta ? "beta" : "prod"}:stats:commandsTotal`, "0");
		Redis.KEYS(`${config.beta ? "beta" : "prod"}:stats:commands:*`, async (err, v) => {
			if (err) throw err;
			const keys = [];
			for (const k of v) {
				if (k.indexOf("allTime") !== -1 || k.split(":").length !== 3) continue;
				else keys.push(k);
			}

			if (keys.length > 0) await Redis.DEL(keys.join(" "));
		});
	});

export default Redis;
