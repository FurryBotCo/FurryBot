import config from "../../config";
import YiffyAPI from "yiffy";
import Logger from "../Logger";

const Yiffy = new YiffyAPI({
	userAgent: config.web.userAgent,
	apiKey: config.apis.yiffy.key,
	debug: (url, time) => Logger.debug("Yiffy", `Request to "${url}" took ${time.time}ms`)
});

export default Yiffy;
