import config from "../../config";
import E6API from "e6api";

const E6 = new E6API({
	userAgent: config.web.userAgent,
	apiKey: config.apis.e621.key
});

export default E6;
