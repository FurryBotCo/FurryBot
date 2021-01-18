import DMAPI from "dankmemerapi";
import config from "../../config";
const DankMemerAPI = new DMAPI({
	apiKey: config.apiKeys.dankMemer.token,
	userAgent: config.web.userAgent,
	cacheRequests: false,
	timeout: 6e4
});

export default DankMemerAPI;
