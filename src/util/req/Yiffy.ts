import config from "../../config";
import Logger from "logger";
import YiffyAPI from "yiffy";

const Yiffy = new YiffyAPI({
	userAgent: config.web.userAgent,
	apiKey: config.apis.yiffy.key,
	debug: (url, time) => Logger.debug("Yiffy", `Request to "${url}" took ${time.time}ms`)
});

export default Yiffy;
