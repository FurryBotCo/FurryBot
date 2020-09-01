import config from "../../config";
import FurryBotAPI from "furrybotapi";
import Logger from "../Logger";

const FBAPI = new FurryBotAPI({
	userAgent: config.web.userAgent,
	apiKey: config.apis.furrybot.key,
	debug: (url, time) => Logger.debug("FurryBotAPI", `Request to "${url}" took ${time.time}ms`),
	baseURL: config.beta ? "https://api.furry.bot" : "https://127.2.3.1"
});

export default FBAPI;
