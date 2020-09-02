import IORedis from "ioredis";
import config from "../config";
const Redis = new IORedis(config.keys.redis.port, config.keys.redis.host, {
	password: config.apiKeys.redis.password,
	db: config.apiKeys.redis[config.beta ? "dbBeta" : "db"],
	enableReadyCheck: true,
	autoResendUnfulfilledCommands: true,
	connectionName: `FurryBot${config.beta ? "Beta" : ""}`
});

export default Redis;