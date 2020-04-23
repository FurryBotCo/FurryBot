import redis from "async-redis";
import config from "../config";
import Logger from "./LoggerV8";

const rClient = redis.createClient(config.keys.redis.port, config.keys.redis.host, {
	password: config.keys.redis.password
});

rClient
	.on("error", (err) => {
		Logger.error("Redis", err);
	})
	.on("ready", () => {
		rClient.CLIENT("SETNAME", `FurryBot${config.beta ? "Beta" : "Production"}`);
		Logger.debug("Redis", "Ready");
	})
	// set some stats to zero on first ready
	.once("ready", () => {
		rClient.SET(`${config.beta ? "beta" : "prod"}:stats:messages`, "0");
		rClient.KEYS(`${config.beta ? "beta" : "prod"}:stats:commands:*`, async (err, v) => {
			if (err) throw err;
			const keys = [];
			for (const k of v) {
				if (k.indexOf("allTime") !== -1 || k.split(":").length !== 3) continue;
				else keys.push(k);
			}

			if (keys.length > 0) await rClient.DEL(keys.join(" "));
		});
	});

export default rClient;
