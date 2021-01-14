import config from "../../config";
import YiffyAPI from "yiffy";
import Logger from "../Logger";

const Yiffy = new YiffyAPI({
	userAgent: config.web.userAgent,
	apiKey: config.apis.furrybot.key,
	debug: (url, time) => Logger.debug("Yiffy", `Request to "${url}" took ${time.time}ms`),
	baseURL: config.beta ? "https://yiff.rest" : "https://127.2.20.1"
});

export default Yiffy;
