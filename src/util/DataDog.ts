import { StatsD } from "node-dogstatsd";
import config from "../config";

const statsd = new StatsD(config.keys.dog.host, config.keys.dog.port);

export default statsd;
