import config from "../../config";
import E6API from "e6api";

const E6 = new E6API({
	userAgent: config.web.userAgent,
	apiKey: config.apiKeys.e621.apiKey
});

export default E6;
