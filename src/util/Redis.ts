import IORedis from "ioredis";
import config from "../config";

const Redis = new IORedis(config.keys.redis.port, config.keys.redis.host, {
	password: config.keys.redis.password,
	db: config.keys.redis[config.beta ? "dbBeta" : "db"],
	enableReadyCheck: true,
	autoResendUnfulfilledCommands: true,
	connectionName: `Furry Bot${config.beta ? " Beta" : ""}`
});

export default Redis;
