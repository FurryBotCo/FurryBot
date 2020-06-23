import { StatsD } from "node-dogstatsd";
import config from "../../config";

const statsd = new StatsD(config.apiKeys.ddog.host, config.apiKeys.ddog.port);

export default statsd;
