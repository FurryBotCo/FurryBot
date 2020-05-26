import config from "../../config";
import FurryBotAPI from "furrybotapi";

const FBAPI = new FurryBotAPI({
	userAgent: config.web.userAgent,
	apiKey: config.apiKeys.furrybot.key
});

export default FBAPI;
