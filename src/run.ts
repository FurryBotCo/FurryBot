import config from "./config";
import ClusterManager from "./clustering/ClusterManager";

const c = new ClusterManager(`${__dirname}/bot/index.ts`, config.client.token, config.client.options);

c.launch();
