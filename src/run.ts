import config from "./config";
import ClusterManager from "./clustering/ClusterManager";
import "./util/MonkeyPatch";
import "./util/ReNice";

const c = new ClusterManager(`${__dirname}/main.${__filename.split(".").slice(-1)[0]}`, config.client.token, config.client.options);

c.launch();
