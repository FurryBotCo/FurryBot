import config from "../../config";
import DankMemerAPI from "dankmemerapi";

const DMAPI = new DankMemerAPI(config.apiKeys.dankMemer.token, config.web.userAgent, true);

export default DMAPI;
