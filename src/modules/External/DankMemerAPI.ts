import config from "../../config";
import DankMemerAPI from "dankmemerapi";

const DMAPI = new DankMemerAPI({
	apiKey: config.apiKeys.dankMemer.token,
	userAgent: config.web.userAgent,
	cacheRequests: true,
	timeout: 3e4
});

export default DMAPI;
